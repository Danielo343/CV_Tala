// 1. Importaciones
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const { diff } = require('deep-diff'); // <-- ¡AQUÍ ESTÁ LA LIBRERÍA QUE INSTALASTE!
require('dotenv').config();

// 2. Configuración del Servidor
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

// 3. Conexión a la Base de Datos PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'CV_Tala',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('❌ Error conectando a la base de datos PostgreSQL', err);
  else console.log('🚀 Conectado a la base de datos PostgreSQL en:', res.rows[0].now);
});

// 4. Autenticación (Sin cambios)
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`\n--- Intento de Login ---`);
    console.log(`Usuario recibido: ${username}`);
    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE nombre_usuario = $1', [username]);
        const user = result.rows[0];
        if (!user) {
            console.log('Resultado: Usuario no encontrado en la base de datos.');
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
        console.log('Resultado: Usuario encontrado:', user.nombre_usuario);
        const passwordValida = await bcrypt.compare(password, user.contrasena_hash);
        console.log('¿La contraseña es válida?:', passwordValida);
        console.log('------------------------\n');
        if (passwordValida) {
            const tokenPayload = {
              id: user.id,
              username: user.nombre_usuario,
              rol: user.rol 
            };
            const token = jwt.sign(
              tokenPayload,
              process.env.JWT_SECRET,
              { expiresIn: '8h' } 
            );
            res.json({
                id: user.id,
                username: user.nombre_usuario,
                name: user.nombre_completo,
                rol: user.rol,
                accessToken: token 
            });
        } else {
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    } catch (err) {
        console.error('❌ Error fatal en el login:', err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// --- 5. Middlewares de Seguridad (Sin cambios) ---
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    if (token == null) {
        return res.status(401).json({ message: 'Acceso denegado: No hay token' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token no válido o expirado' });
        }
        req.user = user; 
        next(); 
    });
};

const adminOnly = (req, res, next) => {
    // Tu BD usa 'admin' y 'usuario'
    if (req.user && req.user.rol === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado: Se requiere rol de Administrador' });
    }
};

// --- FUNCIÓN HELPER PARA LA BITÁCORA (Sin cambios) ---
const registrarHistorial = async (id_usuario, nombre_usuario, accion, tipo_entidad, id_entidad, detalles) => {
  try {
    const query = `
      INSERT INTO historial_actividad 
        (id_usuario, nombre_usuario, accion, tipo_entidad, id_entidad, detalles)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    // Asegurarnos de que id_usuario no sea nulo (ej. en un error muy temprano)
    const userId = id_usuario || null;
    const userName = nombre_usuario || 'Sistema';

    await pool.query(query, [userId, userName, accion, tipo_entidad, id_entidad, detalles]);
    console.log(`HISTORIAL: Usuario ${userName} [${accion}] ${tipo_entidad} ID ${id_entidad}`);
  } catch (err) {
    console.error("Error al registrar en historial_actividad:", err);
  }
};

// --- ¡NUEVO! FUNCIÓN HELPER PARA COMPARAR CAMBIOS ---
/**
 * Compara dos objetos y genera un string con los cambios.
 * @param {object} antiguo - El objeto ANTES de la actualización (de la BD).
 * @param {object} nuevo - El objeto (req.body) con los datos NUEVOS.
 * @returns {string} - Un string describiendo los cambios (ej: "Cambió rol: 'usuario' -> 'admin'")
 */
const generarDetalleDeCambios = (antiguo, nuevo) => {
  // Filtramos 'nuevo' para que solo contenga claves que existen en 'antiguo'
  // Esto evita que 'deep-diff' reporte la creación de claves que no son de la BD (como 'password')
  const nuevoFiltrado = {};
  Object.keys(antiguo).forEach(key => {
    // Usamos hasOwnProperty para asegurarnos de que la propiedad viene en el body
    // y no es heredada
    if (nuevo.hasOwnProperty(key)) { 
      
      // Normalización de valores para comparación
      let valorAntiguo = antiguo[key];
      let valorNuevo = nuevo[key];

      // 1. Tratar null/undefined/"" como equivalentes para no ensuciar el log
      if (valorAntiguo === null || valorAntiguo === undefined) valorAntiguo = "";
      if (valorNuevo === null || valorNuevo === undefined) valorNuevo = "";
      
      // 2. Convertir números a string para comparar '123' con 123
      valorAntiguo = String(valorAntiguo);
      valorNuevo = String(valorNuevo);

      // 3. Trimear strings
      if (typeof valorAntiguo === 'string') valorAntiguo = valorAntiguo.trim();
      if (typeof valorNuevo === 'string') valorNuevo = valorNuevo.trim();

      // Solo añadimos al objeto filtrado si realmente son diferentes
      if (valorAntiguo !== valorNuevo) {
        nuevoFiltrado[key] = nuevo[key]; // Usamos el valor original de 'nuevo'
      } else {
        // Si son iguales (ej. 123 vs '123' o null vs ''),
        // ponemos el valor antiguo en 'nuevoFiltrado' para que deep-diff los vea iguales.
        nuevoFiltrado[key] = antiguo[key];
      }
    }
  });


  const diferencias = diff(antiguo, nuevoFiltrado);
  const cambios = [];

  if (!diferencias) {
    return "(Sin cambios detectados)";
  }

  // Mapear campos de la BD a nombres amigables
  const nombresCampos = {
    nombre_completo: 'Nombre Completo',
    nombre_usuario: 'Usuario',
    rol: 'Rol',
    email: 'Email',
    fecha_activacion: 'Fecha Activación',
    hora_activacion: 'Hora Activación',
    paciente_nombre: 'Paciente',
    paciente_edad: 'Edad',
    paciente_sexo: 'Sexo',
    hospital_destino: 'Hospital',
    nombre_evento: 'Nombre Evento',
    fecha: 'Fecha Evento',
    estado: 'Estado',
    lugar: 'Lugar',
    // ... puedes añadir más traducciones si quieres
  };

  diferencias.forEach(d => {
    // Solo nos interesan las ediciones (kind: 'E')
    if (d.kind === 'E') {
      const campo = d.path.join('.');
      const nombreAmigable = nombresCampos[campo] || campo; 
      
      const valorAntiguo = d.lhs === null || d.lhs === undefined || d.lhs === '' ? '(vacío)' : `'${d.lhs}'`;
      const valorNuevo = d.rhs === null || d.rhs === undefined || d.rhs === '' ? '(vacío)' : `'${d.rhs}'`;

      // Evitar registrar cambios de 'id' o 'contrasena_hash'
      if (campo !== 'id' && campo !== 'contrasena_hash' && campo !== 'fecha_captura' && campo !== 'hora_captura') {
        cambios.push(`${nombreAmigable}: ${valorAntiguo} -> ${valorNuevo}`);
      }
    }
  });

  if (cambios.length === 0) {
    return "(Sin cambios detectados)";
  }
  
  return cambios.join(', ');
};
// --- FIN FUNCIÓN HELPER DE COMPARACIÓN ---


// 6. Endpoint de Catálogos (Sin cambios)
app.get('/api/catalogos', verificarToken, async (req, res) => {
  try {
    const [
      tipos_activacion, causa_clinica, agentes_causantes,
      causas_traumaticas, unidades, estados_traslado,
      estados_pupilas, estados_piel, tipos_lesion, ubicaciones_lesion,
      tipos_evento, categorias_evento, personal, unidades_transporte
    ] = await Promise.all([
      pool.query('SELECT * FROM tipo_activacion ORDER BY id'),
      pool.query('SELECT * FROM causa_clinica ORDER BY id'),
      pool.query('SELECT * FROM agente_causante_general ORDER BY id'),
      pool.query('SELECT * FROM causa_traumatica_especifica ORDER BY id'),
      pool.query('SELECT * FROM unidad_asignada ORDER BY id'),
      pool.query('SELECT * FROM estado_traslado ORDER BY id'),
      pool.query('SELECT * FROM estado_pupilas ORDER BY id'),
      pool.query('SELECT * FROM estado_piel ORDER BY id'),
      pool.query('SELECT * FROM tipo_lesion ORDER BY id'),
      pool.query('SELECT * FROM ubicacion_lesion ORDER BY id'),
      pool.query('SELECT * FROM tipo_evento ORDER BY id'),
      pool.query('SELECT * FROM categoria_evento ORDER BY id'),
      pool.query('SELECT id, nombre_completo AS nombre FROM usuarios ORDER BY nombre_completo'),
      pool.query('SELECT id, nombre AS codigo, nombre AS descripcion FROM unidad_asignada ORDER BY nombre')
    ]);

    res.json({
      tipos_activacion: tipos_activacion.rows,
      causa_clinica: causa_clinica.rows,
      agentes_causantes: agentes_causantes.rows,
      causas_traumaticas: causas_traumaticas.rows,
      unidades: unidades.rows,
      estados_traslado: estados_traslado.rows,
      estados_pupilas: estados_pupilas.rows,
      estados_piel: estados_piel.rows,
      tipos_lesion: tipos_lesion.rows,
      ubicaciones_lesion: ubicaciones_lesion.rows,
      tipos_evento: tipos_evento.rows,
      categorias: categorias_evento.rows,
      personal: personal.rows,
      unidades_transporte: unidades_transporte.rows
    });
  } catch (err) {
    console.error('❌ Error al obtener catálogos:', err);
    res.status(500).json({ error: 'Error interno al cargar catálogos' });
  }
});

// --- RUTAS PARA ACTIVACIONES (CON LOG DETALLADO) ---

// Crear una activación: [Permitido para rol 'usuario' y 'admin']
app.post('/api/activaciones', verificarToken, async (req, res) => {
  const { paciente_nombre } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const activacionQuery = `
      INSERT INTO activaciones (
        fecha_activacion, hora_activacion, origen_reporte, num_reporte_externo, 
        requirio_traslado, hospital_destino, paciente_nombre, paciente_edad, 
        paciente_sexo, causa_clinica_especifica, ct_especifico, id_tipo_activacion, 
        id_unidad_asignada, id_causa_clinica, id_agente_causante_general, id_estado_traslado,
        tipo_activacion_otro
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id, num_reporte_local;
    `;
    const activacionValues = [
      req.body.fecha_activacion, req.body.hora_activacion,
      req.body.origen_reporte || 'Local', req.body.num_reporte_externo,
      req.body.requirio_traslado, req.body.requirio_traslado ? req.body.hospital_destino : null, 
      req.body.paciente_nombre, req.body.paciente_edad,
      req.body.paciente_sexo, req.body.causa_clinica_especifica, req.body.ct_especifico,
      req.body.id_tipo_activacion, req.body.id_unidad_asignada, req.body.id_causa_clinica,
      req.body.id_agente_causante_general, !req.body.requirio_traslado ? req.body.id_estado_traslado : null,
      req.body.tipo_activacion_otro
    ];
    const nuevaActivacionResult = await client.query(activacionQuery, activacionValues);
    const nuevaActivacion = nuevaActivacionResult.rows[0];
    const nuevaActivacionId = nuevaActivacion.id;

    if (req.body.id_causas_traumaticas && req.body.id_causas_traumaticas.length > 0) {
      const causaTraumaticaQuery = 'INSERT INTO activacion_causas_traumaticas (id_activacion, id_causa_traumatica_especifica) VALUES ($1, $2)';
      for (const id_causa of req.body.id_causas_traumaticas) {
        await client.query(causaTraumaticaQuery, [nuevaActivacionId, id_causa]);
      }
    }
    if (req.body.evaluacion && (req.body.evaluacion.id_estado_pupilas || req.body.evaluacion.id_estado_piel)) {
      const evaluacionQuery = `
        INSERT INTO evaluacion_clinica (id_activacion, anisocoria_lado, id_estado_pupilas, id_estado_piel)
        VALUES ($1, $2, $3, $4);
      `;
      await client.query(evaluacionQuery, [
        nuevaActivacionId,
        req.body.evaluacion.anisocoria_lado || null,
        req.body.evaluacion.id_estado_pupilas || null,
        req.body.evaluacion.id_estado_piel || null
      ]);
    }
    if (req.body.lesiones && req.body.lesiones.length > 0) {
      const lesionQuery = `
        INSERT INTO lesiones_activacion (id_activacion, descripcion_lesion, id_tipo_lesion, id_ubicacion_lesion)
        VALUES ($1, $2, $3, $4);
      `;
      for (const lesion of req.body.lesiones) {
        if (lesion.id_tipo_lesion || lesion.id_ubicacion_lesion || (lesion.descripcion_lesion && lesion.descripcion_lesion.trim() !== '')) {
            await client.query(lesionQuery, [
              nuevaActivacionId,
              lesion.descripcion_lesion,
              lesion.id_tipo_lesion,
              lesion.id_ubicacion_lesion
            ]);
        }
      }
    }
    await client.query('COMMIT');
    
    await registrarHistorial(
      req.user.id, 
      req.user.username, 
      'CREAR', 
      'ACTIVACION', 
      nuevaActivacion.id, 
      `Creó la activación '${nuevaActivacion.num_reporte_local}' para: ${paciente_nombre}`
    );

    res.status(201).json({ 
      message: 'Activación registrada exitosamente',
      data: nuevaActivacion 
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error detallado en la transacción:', err);
    res.status(500).json({ error: 'Error al guardar el registro. Revise la consola del servidor para más detalles.' });
  } finally {
    client.release();
  }
});

// Ver activaciones (Sin cambios)
app.get('/api/activaciones', verificarToken, async (req, res) => {
  const { scope, fecha_inicio, fecha_fin } = req.query;
  try {
    let query = `
      SELECT 
        a.id,
        a.num_reporte_local,
        a.fecha_activacion,
        a.hora_activacion,
        a.paciente_nombre,
        a.paciente_edad,
        a.paciente_sexo,
        ta.nombre AS tipo_activacion,
        cc.nombre AS causa_clinica
      FROM 
        activaciones AS a
      LEFT JOIN 
        tipo_activacion AS ta ON a.id_tipo_activacion = ta.id
      LEFT JOIN 
        causa_clinica AS cc ON a.id_causa_clinica = cc.id
    `;
    const values = [];
    if (scope === 'today') {
      query += ' WHERE a.fecha_activacion = CURRENT_DATE ';
    } else if (fecha_inicio && fecha_fin) {
      values.push(fecha_inicio, fecha_fin);
      query += ' WHERE a.fecha_activacion BETWEEN $1 AND $2 ';
    }
    query += ' ORDER BY a.fecha_activacion DESC, a.hora_activacion DESC;';
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener las activaciones:', err);
    res.status(500).json({ error: 'Error interno al consultar los registros.' });
  }
});

// Ver una activación (Sin cambios)
app.get('/api/activaciones/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  try {
    const activacionQuery = `
      SELECT 
        a.*,
        ta.nombre AS tipo_activacion_nombre,
        ua.nombre AS unidad_asignada_nombre,
        cc.nombre AS causa_clinica_nombre,
        agc.nombre AS agente_causante_general_nombre,
        et.nombre AS estado_traslado_nombre,
        (SELECT u.nombre_completo FROM usuarios u WHERE u.id = 1) AS usuario_captura
      FROM activaciones a
      LEFT JOIN tipo_activacion ta ON a.id_tipo_activacion = ta.id
      LEFT JOIN unidad_asignada ua ON a.id_unidad_asignada = ua.id
      LEFT JOIN causa_clinica cc ON a.id_causa_clinica = cc.id
      LEFT JOIN agente_causante_general agc ON a.id_agente_causante_general = agc.id
      LEFT JOIN estado_traslado et ON a.id_estado_traslado = et.id
      WHERE a.id = $1;
    `;
    const evaluacionQuery = `
      SELECT 
        ec.*,
        ep.nombre AS estado_pupilas_nombre,
        esk.nombre AS estado_piel_nombre
      FROM evaluacion_clinica ec
      LEFT JOIN estado_pupilas ep ON ec.id_estado_pupilas = ep.id
      LEFT JOIN estado_piel esk ON ec.id_estado_piel = esk.id
      WHERE ec.id_activacion = $1;
    `;
    const causasTraumaticasQuery = `
      SELECT 
        ct.nombre,
        ct.id
      FROM activacion_causas_traumaticas act
      JOIN causa_traumatica_especifica ct ON act.id_causa_traumatica_especifica = ct.id
      WHERE act.id_activacion = $1;
    `;
    const lesionesQuery = `
      SELECT 
        la.*,
        tl.nombre AS tipo_lesion_nombre,
        ul.nombre AS ubicacion_lesion_nombre
      FROM lesiones_activacion la
      LEFT JOIN tipo_lesion tl ON la.id_tipo_lesion = tl.id
      LEFT JOIN ubicacion_lesion ul ON la.id_ubicacion_lesion = ul.id
      WHERE la.id_activacion = $1;
    `;
    const [
      activacionResult,
      evaluacionResult,
      causasTraumaticasResult,
      lesionesResult
    ] = await Promise.all([
      pool.query(activacionQuery, [id]),
      pool.query(evaluacionQuery, [id]),
      pool.query(causasTraumaticasQuery, [id]),
      pool.query(lesionesQuery, [id])
    ]);
    if (activacionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    const activacionCompleta = activacionResult.rows[0];
    activacionCompleta.evaluacion = evaluacionResult.rows[0] || null;
    activacionCompleta.causas_traumaticas = causasTraumaticasResult.rows; 
    activacionCompleta.lesiones = lesionesResult.rows;
    activacionCompleta.causas_traumaticas_nombres = causasTraumaticasResult.rows.map(r => r.nombre);
    res.json(activacionCompleta);
  } catch (err) {
    console.error(`Error al obtener detalle de activación ${id}:`, err);
    res.status(500).json({ error: 'Error interno al consultar el registro.' });
  }
});

// Editar una activación: [Admin, REGISTRO DETALLADO]
app.put('/api/activaciones/:id', [verificarToken, adminOnly], async (req, res) => {
  const { id } = req.params;
  const datosNuevos = req.body; 
  
  const client = await pool.connect();
  try {
    // --- ¡NUEVO! PASO 1: Obtener datos antiguos ANTES de actualizar ---
    // Hacemos un query simple, ya que deep-diff comparará los IDs
    const infoAntigua = await pool.query('SELECT * FROM activaciones WHERE id = $1', [id]);
    if (infoAntigua.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Activación no encontrada' });
    }
    const datosAntiguos = infoAntigua.rows[0];

    // --- PASO 2: Realizar la transacción de actualización ---
    await client.query('BEGIN');
    const final_hospital_destino = datosNuevos.requirio_traslado ? datosNuevos.hospital_destino : null;
    const final_id_estado_traslado = !datosNuevos.requirio_traslado ? datosNuevos.id_estado_traslado : null;
    const activacionQuery = `
      UPDATE activaciones SET
        fecha_activacion = $1, hora_activacion = $2, origen_reporte = $3, num_reporte_externo = $4, 
        requirio_traslado = $5, hospital_destino = $6, paciente_nombre = $7, paciente_edad = $8, 
        paciente_sexo = $9, causa_clinica_especifica = $10, ct_especifico = $11, id_tipo_activacion = $12, 
        id_unidad_asignada = $13, id_causa_clinica = $14, id_agente_causante_general = $15, 
        id_estado_traslado = $16, tipo_activacion_otro = $17
      WHERE id = $18
      RETURNING num_reporte_local;
    `;
    const activacionValues = [
      datosNuevos.fecha_activacion, datosNuevos.hora_activacion,
      datosNuevos.origen_reporte || 'Local', datosNuevos.num_reporte_externo,
      datosNuevos.requirio_traslado, final_hospital_destino,
      datosNuevos.paciente_nombre, datosNuevos.paciente_edad,
      datosNuevos.paciente_sexo, datosNuevos.causa_clinica_especifica, datosNuevos.ct_especifico,
      datosNuevos.id_tipo_activacion, datosNuevos.id_unidad_asignada, datosNuevos.id_causa_clinica,
      datosNuevos.id_agente_causante_general, final_id_estado_traslado,
      datosNuevos.tipo_activacion_otro,
      id
    ];
    const updateResult = await client.query(activacionQuery, activacionValues);
    const updatedFolio = updateResult.rows[0].num_reporte_local;

    // Actualizar tablas relacionadas
    await client.query('DELETE FROM activacion_causas_traumaticas WHERE id_activacion = $1', [id]);
    if (datosNuevos.id_causas_traumaticas && datosNuevos.id_causas_traumaticas.length > 0) {
      const causaTraumaticaQuery = 'INSERT INTO activacion_causas_traumaticas (id_activacion, id_causa_traumatica_especifica) VALUES ($1, $2)';
      for (const id_causa of datosNuevos.id_causas_traumaticas) {
        await client.query(causaTraumaticaQuery, [id, id_causa]);
      }
    }
    await client.query('DELETE FROM evaluacion_clinica WHERE id_activacion = $1', [id]);
    if (datosNuevos.evaluacion && (datosNuevos.evaluacion.id_estado_pupilas || datosNuevos.evaluacion.id_estado_piel)) {
      const evaluacionQuery = `INSERT INTO evaluacion_clinica (id_activacion, anisocoria_lado, id_estado_pupilas, id_estado_piel) VALUES ($1, $2, $3, $4);`;
      await client.query(evaluacionQuery, [
        id, datosNuevos.evaluacion.anisocoria_lado || null, datosNuevos.evaluacion.id_estado_pupilas || null, datosNuevos.evaluacion.id_estado_piel || null
      ]);
    }
    await client.query('DELETE FROM lesiones_activacion WHERE id_activacion = $1', [id]);
    if (datosNuevos.lesiones && datosNuevos.lesiones.length > 0) {
      const lesionQuery = `INSERT INTO lesiones_activacion (id_activacion, descripcion_lesion, id_tipo_lesion, id_ubicacion_lesion) VALUES ($1, $2, $3, $4);`;
      for (const lesion of datosNuevos.lesiones) {
        if (lesion.id_tipo_lesion || lesion.id_ubicacion_lesion || (lesion.descripcion_lesion && lesion.descripcion_lesion.trim() !== '')) {
            await client.query(lesionQuery, [id, lesion.descripcion_lesion, lesion.id_tipo_lesion, lesion.id_ubicacion_lesion]);
        }
      }
    }
    
    await client.query('COMMIT');

    // --- ¡NUEVO! PASO 3: Generar detalles y registrar historial ---
    // Comparamos solo los campos relevantes de la tabla principal 'activaciones'
    const cambiosTexto = generarDetalleDeCambios(datosAntiguos, datosNuevos);
    
    let detalleFinal = `Editó la activación '${updatedFolio}'. `;
    if (cambiosTexto && cambiosTexto !== '(Sin cambios detectados)') {
      detalleFinal += `Cambios: [${cambiosTexto}]`;
    } else {
      detalleFinal += "(Cambios menores o en tablas relacionadas detectados)";
    }

    await registrarHistorial(
      req.user.id, 
      req.user.username, 
      'EDITAR', 
      'ACTIVACION', 
      id, 
      detalleFinal
    );
    // --- FIN DE CAMBIOS ---

    res.status(200).json({ 
      message: 'Activación actualizada exitosamente',
      data: { num_reporte_local: updatedFolio }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Error al actualizar activación ${id}:`, err);
    res.status(500).json({ error: 'Error al actualizar el registro. La operación fue revertida.' });
  } finally {
    client.release();
  }
});

// ¡NUEVO! Borrar una activación
// [Debe ser Admin, REGISTRO DETALLADO]
app.delete('/api/activaciones/:id', [verificarToken, adminOnly], async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'ID de activación requerido para eliminar.' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const infoQuery = await pool.query('SELECT num_reporte_local, paciente_nombre FROM activaciones WHERE id = $1', [id]);
        if (infoQuery.rowCount === 0) {
           await client.query('ROLLBACK');
           client.release();
           return res.status(404).json({ error: 'Activación no encontrada.' });
        }
        const { num_reporte_local, paciente_nombre } = infoQuery.rows[0];

        const deleteQuery = 'DELETE FROM activaciones WHERE id = $1 RETURNING id;';
        const result = await client.query(deleteQuery, [id]);
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ error: 'Activación no encontrada.' });
        }
        
        await client.query('COMMIT');
        console.log(`✅ Activación ID: ${id} eliminada exitosamente.`);

        // --- REGISTRAR EN HISTORIAL ---
        await registrarHistorial(
          req.user.id, 
          req.user.username, 
          'ELIMINAR', 
          'ACTIVACION', 
          id, 
          `Eliminó la activación '${num_reporte_local}' (Paciente: ${paciente_nombre})`
        );
        // --- FIN DE REGISTRO ---

        res.status(200).json({ 
            message: `Activación con ID ${id} eliminada exitosamente.`,
            id: id
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Error al eliminar la activación ID ${id}:`, err);
        res.status(500).json({ 
            error: 'Error interno del servidor al eliminar la activación.',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } finally {
        client.release();
    }
});


// --- RUTAS PARA EVENTOS (CON LOG DETALLADO) ---

// Crear un evento (Sin cambios en el log)
app.post('/api/eventos', verificarToken, async (req, res) => {
  console.log('📨 RECIBIENDO PETICIÓN POST /api/eventos');
  const { nombre_evento } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const eventoQuery = `
      INSERT INTO eventos (
        nombre_evento, id_tipo_evento, id_categoria, fecha, hora_inicio, hora_fin,
        estado, lugar, direccion, organizador, institucion_responsable, 
        participantes_esperados, ambulancias_asignadas, personal_medico, 
        personal_apoyo, objetivos, descripcion, id_responsable, 
        observaciones, lecciones_aprendidas, observaciones_unidades
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING id, nombre_evento;
    `;
    const eventoValues = [
      req.body.nombre_evento, req.body.id_tipo_evento, req.body.id_categoria || null, req.body.fecha, req.body.hora_inicio, 
      req.body.hora_fin || null, req.body.estado || 'planificado', req.body.lugar, req.body.direccion || null, 
      req.body.organizador || null, req.body.institucion_responsable || null, req.body.participantes_esperados || null, 
      req.body.ambulancias_asignadas || null, req.body.personal_medico || null, req.body.personal_apoyo || null, 
      req.body.objetivos || null, req.body.descripcion || null, req.body.id_responsable || null, 
      req.body.observaciones || null, req.body.lecciones_aprendidas || null, req.body.observaciones_unidades || null
    ];
    
    const nuevoEventoResult = await client.query(eventoQuery, eventoValues);
    const nuevoEvento = nuevoEventoResult.rows[0];
    const nuevoEventoId = nuevoEvento.id;
    
    if (req.body.personal_participante_ids && req.body.personal_participante_ids.length > 0) {
      const personalQuery = 'INSERT INTO evento_personal (id_evento, id_usuario) VALUES ($1, $2)';
      for (const id_usuario of req.body.personal_participante_ids) {
        await client.query(personalQuery, [nuevoEventoId, id_usuario]);
      }
    }
    if (req.body.unidades_atienden && req.body.unidades_atienden.length > 0) {
      const getUnitIdsQuery = `SELECT id FROM unidad_asignada WHERE nombre = ANY($1::text[])`; 
      const unitIdsResult = await client.query(getUnitIdsQuery, [req.body.unidades_atienden]);
      const unitIds = unitIdsResult.rows.map(row => row.id);
      if (unitIds.length > 0) {
        const unidadesQuery = 'INSERT INTO evento_unidades (id_evento, id_unidad_transporte) VALUES ($1, $2)'; 
        for (const id_unidad of unitIds) {
          await client.query(unidadesQuery, [nuevoEventoId, id_unidad]);
        }
      }
    }

    await client.query('COMMIT');

    await registrarHistorial(
      req.user.id, 
      req.user.username, 
      'CREAR', 
      'EVENTO', 
      nuevoEvento.id, 
      `Creó el evento '${nuevoEvento.nombre_evento}'`
    );

    res.status(201).json({ 
      message: 'Evento registrado exitosamente',
      data: nuevoEvento
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error en la transacción de eventos:', err);
    res.status(500).json({ 
      error: 'Error al guardar el evento.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
});

// Ver eventos (Sin cambios)
app.get('/api/eventos', verificarToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        e.id, e.nombre_evento, e.fecha, e.hora_inicio, e.estado, e.lugar, 
        e.descripcion, e.participantes_esperados, e.id_tipo_evento, e.id_responsable,
        te.nombre AS tipo_evento,
        u.nombre_completo AS responsable,
        (
            SELECT array_agg(ua.nombre) 
            FROM evento_unidades AS eu
            JOIN unidad_asignada AS ua ON eu.id_unidad_transporte = ua.id
            WHERE eu.id_evento = e.id
        ) AS unidades_atienden
      FROM 
        eventos AS e
      LEFT JOIN 
        tipo_evento AS te ON e.id_tipo_evento = te.id
      LEFT JOIN 
        usuarios AS u ON e.id_responsable = u.id
      ORDER BY 
        e.fecha DESC, e.hora_inicio DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener la lista de eventos:', err);
    res.status(500).json({ error: 'Error interno al consultar los eventos.' });
  }
});

// Ver un evento (Sin cambios)
app.get('/api/eventos/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                e.*, 
                (SELECT array_agg(ep.id_usuario) FROM evento_personal AS ep WHERE ep.id_evento = e.id) AS personal_participante_ids,
                (SELECT array_agg(ua.nombre) FROM evento_unidades AS eu JOIN unidad_asignada AS ua ON eu.id_unidad_transporte = ua.id WHERE eu.id_evento = e.id) AS unidades_atienden
            FROM 
                eventos AS e
            WHERE 
                e.id = $1;
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        const eventoCompleto = result.rows[0];
        eventoCompleto.personal_participante_ids = eventoCompleto.personal_participante_ids || [];
        eventoCompleto.unidades_atienden = eventoCompleto.unidades_atienden || [];
        
        res.json(eventoCompleto);
    } catch (err) {
        console.error(`❌ Error al obtener detalles del evento ${id}:`, err);
        res.status(500).json({ error: 'Error interno al consultar el evento.' });
    }
});

// Editar un evento: [Admin, REGISTRO DETALLADO]
app.put('/api/eventos/:id', [verificarToken, adminOnly], async (req, res) => {
    const { id } = req.params;
    const datosNuevos = req.body;
    
    const client = await pool.connect();
    try {
        // --- ¡NUEVO! PASO 1: Obtener datos antiguos ANTES de actualizar ---
        const infoAntiguaQuery = `
            SELECT 
                e.*, 
                (SELECT array_agg(ua.nombre) FROM evento_unidades AS eu JOIN unidad_asignada AS ua ON eu.id_unidad_transporte = ua.id WHERE eu.id_evento = e.id) AS unidades_atienden
            FROM eventos AS e
            WHERE e.id = $1;
        `;
        const infoAntigua = await pool.query(infoAntiguaQuery, [id]);
        if (infoAntigua.rows.length === 0) {
            client.release();
            return res.status(404).json({ error: 'Evento no encontrado' });
        }
        const datosAntiguos = infoAntigua.rows[0];
        datosAntiguos.unidades_atienden = datosAntiguos.unidades_atienden || [];

        // --- PASO 2: Realizar la transacción de actualización ---
        await client.query('BEGIN');
        const eventoUpdateQuery = `
            UPDATE eventos SET
                nombre_evento = $1, id_tipo_evento = $2, id_categoria = $3, fecha = $4, hora_inicio = $5, 
                hora_fin = $6, estado = $7, lugar = $8, direccion = $9, organizador = $10, 
                institucion_responsable = $11, participantes_esperados = $12, ambulancias_asignadas = $13, 
                personal_medico = $14, personal_apoyo = $15, objetivos = $16, descripcion = $17, 
                id_responsable = $18, observaciones = $19, lecciones_aprendidas = $20, 
                observaciones_unidades = $21
            WHERE id = $22
            RETURNING id, nombre_evento;
        `;
        const eventoUpdateValues = [
            datosNuevos.nombre_evento, datosNuevos.id_tipo_evento, datosNuevos.id_categoria || null, datosNuevos.fecha, datosNuevos.hora_inicio, 
            datosNuevos.hora_fin || null, datosNuevos.estado || 'planificado', datosNuevos.lugar, datosNuevos.direccion || null, 
            datosNuevos.organizador || null, datosNuevos.institucion_responsable || null, datosNuevos.participantes_esperados || null, 
            datosNuevos.ambulancias_asignadas || null, datosNuevos.personal_medico || null, datosNuevos.personal_apoyo || null, 
            datosNuevos.objetivos || null, datosNuevos.descripcion || null, datosNuevos.id_responsable || null, 
            datosNuevos.observaciones || null, datosNuevos.lecciones_aprendidas || null, 
            datosNuevos.observaciones_unidades || null, id
        ];

        const result = await client.query(eventoUpdateQuery, eventoUpdateValues);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            throw new Error("Evento no encontrado para actualizar.");
        }

        await client.query('DELETE FROM evento_personal WHERE id_evento = $1', [id]);
        if (datosNuevos.personal_participante_ids && datosNuevos.personal_participante_ids.length > 0) {
            const personalQuery = 'INSERT INTO evento_personal (id_evento, id_usuario) VALUES ($1, $2)';
            for (const id_usuario of datosNuevos.personal_participante_ids) {
                await client.query(personalQuery, [id, id_usuario]);
            }
        }
        await client.query('DELETE FROM evento_unidades WHERE id_evento = $1', [id]);
        if (datosNuevos.unidades_atienden && datosNuevos.unidades_atienden.length > 0) {
            const getUnitIdsQuery = `SELECT id FROM unidad_asignada WHERE nombre = ANY($1::text[])`; 
            const unitIdsResult = await client.query(getUnitIdsQuery, [datosNuevos.unidades_atienden]);
            const unitIds = unitIdsResult.rows.map(row => row.id);
            if (unitIds.length > 0) {
                const unidadesQuery = 'INSERT INTO evento_unidades (id_evento, id_unidad_transporte) VALUES ($1, $2)';
                for (const id_unidad of unitIds) {
                    await client.query(unidadesQuery, [id, id_unidad]);
                }
            }
        }
        await client.query('COMMIT');

        // --- ¡NUEVO! PASO 3: Generar detalles y registrar historial ---
        // Comparamos los objetos 'antiguo' y 'nuevo'
        const cambiosTexto = generarDetalleDeCambios(datosAntiguos, datosNuevos);

        let detalleFinal = `Editó el evento '${result.rows[0].nombre_evento}'. `;
        if (cambiosTexto && cambiosTexto !== '(Sin cambios detectados)') {
          detalleFinal += `Cambios: [${cambiosTexto}]`;
        } else {
          detalleFinal += "(Cambios menores o en listas de personal/unidades)";
        }
        
        await registrarHistorial(
          req.user.id, 
          req.user.username, 
          'EDITAR', 
          'EVENTO', 
          id, 
          detalleFinal
        );
        // --- FIN DE CAMBIOS ---

        res.status(200).json({
            message: 'Evento actualizado exitosamente',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error en PUT /api/eventos/:id", err);
        let errorMessage = 'Error al actualizar el evento';
        if (err.code === '23503') errorMessage = 'Error: Referencia de ID inválida (Tipo, Categoría, Responsable o Unidad seleccionados no existen).';
        else if (err.code === '23502') errorMessage = 'Error: Faltan campos obligatorios en la base de datos.';
        else if (err.message.includes('Evento no encontrado')) errorMessage = 'Error: El evento no existe';
        res.status(500).json({ 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } finally {
        client.release();
    }
});

// Borrar un evento: [Admin, REGISTRO DETALLADO]
app.delete('/api/eventos/:id', [verificarToken, adminOnly], async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'ID de evento requerido para eliminar.' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const infoQuery = await pool.query('SELECT nombre_evento FROM eventos WHERE id = $1', [id]);
        if (infoQuery.rowCount === 0) {
           await client.query('ROLLBACK');
           client.release();
           return res.status(404).json({ error: 'Evento no encontrado.' });
        }
        const nombreEvento = infoQuery.rows[0].nombre_evento;

        const deleteQuery = 'DELETE FROM eventos WHERE id = $1 RETURNING id;';
        const result = await client.query(deleteQuery, [id]);
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ error: 'Evento no encontrado.' });
        }
        
        await client.query('COMMIT');
        console.log(`✅ Evento ID: ${id} eliminado exitosamente.`);

        await registrarHistorial(
          req.user.id, 
          req.user.username, 
          'ELIMINAR', 
          'EVENTO', 
          id, 
          `Eliminó el evento '${nombreEvento}' (ID: ${id})`
        );

        res.status(200).json({ 
            message: `Evento con ID ${id} eliminado exitosamente.`,
            id: id
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Error al eliminar el evento ID ${id}:`, err);
        res.status(500).json({ 
            error: 'Error interno del servidor al eliminar el evento.',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } finally {
        client.release();
    }
});


// --- RUTAS CRUD PARA USUARIOS (CON LOG DETALLADO) ---

// OBTENER TODOS LOS USUARIOS (Sin cambios)
app.get('/api/usuarios', [verificarToken, adminOnly], async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre_completo, nombre_usuario, rol, email FROM usuarios ORDER BY nombre_completo');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error interno al consultar usuarios' });
  }
});

// CREAR UN NUEVO USUARIO (Sin cambios en el log)
app.post('/api/usuarios', [verificarToken, adminOnly], async (req, res) => {
  const { nombre_completo, nombre_usuario, password, rol, email } = req.body;
  if (!nombre_completo || !nombre_usuario || !password || !rol) {
    return res.status(400).json({ error: 'Todos los campos son requeridos: nombre_completo, nombre_usuario, password, rol' });
  }
  if (rol !== 'admin' && rol !== 'usuario') {
    return res.status(400).json({ error: "Rol inválido. Debe ser 'admin' o 'usuario'." });
  }
  try {
    const salt = bcrypt.genSaltSync(10);
    const contrasena_hash = bcrypt.hashSync(password, salt);
    const query = `
      INSERT INTO usuarios (nombre_completo, nombre_usuario, contrasena_hash, rol, email)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nombre_completo, nombre_usuario, rol, email;
    `;
    const values = [nombre_completo, nombre_usuario, contrasena_hash, rol, email || null];
    const result = await pool.query(query, values);
    const nuevoUsuario = result.rows[0];

    await registrarHistorial(
      req.user.id, 
      req.user.username, 
      'CREAR', 
      'USUARIO', 
      nuevoUsuario.id, 
      `Creó al usuario '${nuevoUsuario.nombre_usuario}' con rol '${nuevoUsuario.rol}'`
    );

    res.status(201).json(nuevoUsuario);
  } catch (err) {
    if (err.code === '23505') { 
      return res.status(409).json({ error: 'El nombre de usuario ya existe' });
    }
    console.error('Error al crear usuario:', err);
    res.status(500).json({ error: 'Error interno al crear el usuario' });
  }
});

// ACTUALIZAR UN USUARIO: [Admin, REGISTRO DETALLADO]
app.put('/api/usuarios/:id', [verificarToken, adminOnly], async (req, res) => {
  const { id } = req.params;
  const datosNuevos = req.body; // { nombre_completo, nombre_usuario, rol, email, password }
  
  if (!datosNuevos.nombre_completo || !datosNuevos.nombre_usuario || !datosNuevos.rol) {
    return res.status(400).json({ error: 'Los campos nombre_completo, nombre_usuario y rol son requeridos' });
  }
  if (datosNuevos.rol !== 'admin' && datosNuevos.rol !== 'usuario') {
    return res.status(400).json({ error: "Rol inválido. Debe ser 'admin' o 'usuario'." });
  }
  try {
    // --- ¡NUEVO! PASO 1: Obtener datos antiguos ANTES de actualizar ---
    // (Solo traemos los campos que nos interesan para comparar)
    const infoAntigua = await pool.query('SELECT id, nombre_completo, nombre_usuario, rol, email FROM usuarios WHERE id = $1', [id]);
    if (infoAntigua.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const datosAntiguos = infoAntigua.rows[0];
    
    // --- PASO 2: Preparar y ejecutar la actualización ---
    let query;
    let values;
    let passwordCambiada = false;

    if (datosNuevos.password && datosNuevos.password.trim() !== '') {
      passwordCambiada = true;
      const salt = bcrypt.genSaltSync(10);
      const contrasena_hash = bcrypt.hashSync(datosNuevos.password, salt);
      query = `
        UPDATE usuarios SET
          nombre_completo = $1,
          nombre_usuario = $2,
          rol = $3,
          email = $4,
          contrasena_hash = $5
        WHERE id = $6
        RETURNING id, nombre_completo, nombre_usuario, rol, email;
      `;
      values = [datosNuevos.nombre_completo, datosNuevos.nombre_usuario, datosNuevos.rol, datosNuevos.email || null, contrasena_hash, id];
    } else {
      query = `
        UPDATE usuarios SET
          nombre_completo = $1,
          nombre_usuario = $2,
          rol = $3,
          email = $4
        WHERE id = $5
        RETURNING id, nombre_completo, nombre_usuario, rol, email;
      `;
      values = [datosNuevos.nombre_completo, datosNuevos.nombre_usuario, datosNuevos.rol, datosNuevos.email || null, id];
    }
    const result = await pool.query(query, values);
    const usuarioActualizado = result.rows[0];

    // --- ¡NUEVO! PASO 3: Generar detalles y registrar historial ---
    const cambiosTexto = generarDetalleDeCambios(datosAntiguos, datosNuevos);
    
    let detalleFinal = `Editó al usuario '${usuarioActualizado.nombre_usuario}'. `;
    if (cambiosTexto && cambiosTexto !== '(Sin cambios detectados)') {
      detalleFinal += `Cambios: [${cambiosTexto}]. `;
    }
    if (passwordCambiada) {
      detalleFinal += "[Contraseña actualizada].";
    }
    if (cambiosTexto === '(Sin cambios detectados)' && !passwordCambiada) {
      detalleFinal += "(Sin cambios detectados)";
    }

    await registrarHistorial(
      req.user.id, 
      req.user.username, 
      'EDITAR', 
      'USUARIO', 
      usuarioActualizado.id, 
      detalleFinal // <-- ¡El nuevo detalle!
    );
    // --- FIN DE CAMBIOS ---

    res.status(200).json(usuarioActualizado);
  } catch (err) {
    if (err.code === '23505') { 
      return res.status(409).json({ error: 'El nombre de usuario ya existe' });
    }
    console.error(`Error al actualizar usuario ${id}:`, err);
    res.status(500).json({ error: 'Error interno al actualizar el usuario' });
  }
});

// BORRAR UN USUARIO (Log detallado ya estaba)
app.delete('/api/usuarios/:id', [verificarToken, adminOnly], async (req, res) => {
  const { id } = req.params;
  if (req.user.id == id) {
    return res.status(403).json({ error: 'No puedes eliminar tu propia cuenta de administrador' });
  }
  try {
    const infoQuery = await pool.query('SELECT nombre_usuario FROM usuarios WHERE id = $1', [id]);
    if (infoQuery.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    const nombreUsuarioEliminado = infoQuery.rows[0].nombre_usuario;
    
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);

    await registrarHistorial(
      req.user.id, 
      req.user.username, 
      'ELIMINAR', 
      'USUARIO', 
      id, 
      `Eliminó al usuario '${nombreUsuarioEliminado}' (ID: ${id})`
    );

    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (err) {
    console.error(`Error al eliminar usuario ${id}:`, err);
    res.status(500).json({ error: 'Error interno al eliminar el usuario' });
  }
});


// --- RUTA PARA VER EL HISTORIAL (Sin cambios) ---
app.get('/api/historial', [verificarToken, adminOnly], async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM historial_actividad 
       ORDER BY timestamp DESC 
       LIMIT 100` // Traemos los 100 más recientes
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener historial:', err);
    res.status(500).json({ error: 'Error interno al consultar el historial' });
  }
});


// 7. Iniciar Servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor backend unificado corriendo en http://localhost:${PORT}`);
  console.log(`📋 Módulos disponibles: Activaciones, Eventos, Usuarios, Historial`);
  console.log(`🔒 Seguridad: Rutas protegidas por Token JWT y Roles de Admin.`);
});