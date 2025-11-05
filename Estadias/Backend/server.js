// 1. Importaciones (Cambiamos mysql por pg)
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // ¡Importante! Usamos Pool de pg
const bcrypt = require('bcryptjs'); // Para encriptar y comparar contraseñas
require('dotenv').config();

// 2. Configuración del Servidor (Sin cambios)
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware (Sin cambios)
app.use(cors());
app.use(express.json());

// 3. Conexión a la Base de Datos PostgreSQL (¡LA NUEVA VERSIÓN!)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'CV_Tala', // El nombre de tu base de datos
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Verificamos la conexión al iniciar
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos PostgreSQL', err);
  } else {
    console.log('🚀 Conectado a la base de datos PostgreSQL en:', res.rows[0].now);
  }
});


// 4. Autenticación (¡Ahora usando la tabla `usuarios`!)
// (Por ahora, usaremos una autenticación simple, luego puedes añadir JWT)
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    // --- LOG DE DIAGNÓSTICO 1 ---
    // Esto nos dirá si los datos están llegando desde el formulario.
    console.log(`\n--- Intento de Login ---`);
    console.log(`Usuario recibido: ${username}`);
    console.log(`Contraseña recibida: ${password}`);
    // ----------------------------

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE nombre_usuario = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            // --- LOG DE DIAGNÓSTICO 2 ---
            console.log('Resultado: Usuario no encontrado en la base de datos.');
            // ----------------------------
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
        
        // --- LOG DE DIAGNÓSTICO 3 ---
        console.log('Resultado: Usuario encontrado:', user.nombre_usuario);
        console.log('Comparando contraseña con el hash:', user.contrasena_hash);
        // ----------------------------
        
        // ¡LA MEJORA! Comparamos el hash de la BD con la contraseña que nos envían.
        const passwordValida = await bcrypt.compare(password, user.contrasena_hash);

        // --- LOG DE DIAGNÓSTICO 4 ---
        console.log('¿La contraseña es válida?:', passwordValida);
        console.log('------------------------\n');
        // ----------------------------

        if (passwordValida) {
            res.json({
                id: user.id,
                username: user.nombre_usuario,
                name: user.nombre_completo,
                accessToken: 'fake-token-para-desarrollo-' + user.id
            });
        } else {
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

    } catch (err) {
        console.error('❌ Error fatal en el login:', err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


// 5. Rutas de la API (¡LAS NUEVAS RUTAS PARA TU PROYECTO!)

// Endpoint para obtener todos los catálogos de una vez
app.get('/api/catalogos', async (req, res) => {
  try {
    const [
      tipos_activacion, causa_clinica, agentes_causantes,
      causas_traumaticas, unidades, estados_traslado,
      estados_pupilas, estados_piel, tipos_lesion, ubicaciones_lesion
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
    });
  } catch (err) {
    console.error('Error al obtener catálogos', err);
    res.status(500).json({ error: 'Error interno al cargar catálogos' });
  }
});

// Endpoint para crear una nueva activación (VERSIÓN FINAL, AHORA SÍ)
app.post('/api/activaciones', async (req, res) => {
  // 1. Leemos TODOS los campos del formulario
  const {
    fecha_activacion, // Hora del evento (editable)
    hora_activacion,  // Hora del evento (editable)
    origen_reporte,
    num_reporte_externo,
    requirio_traslado = false, // El switch (true/false)
    hospital_destino,
    paciente_nombre,
    paciente_edad = null,
    paciente_sexo,
    causa_clinica_especifica,
    ct_especifico,
    tipo_activacion_otro, // <-- ¡El nuevo campo!
    id_tipo_activacion,
    id_unidad_asignada = null,
    id_causa_clinica = null,
    id_causas_traumaticas = [],
    id_agente_causante_general = null,
    id_estado_traslado = null, // El dropdown ("No amerita", etc.)
    evaluacion = {},
    lesiones = []
  } = req.body;

  // 2. Lógica de traslado (como la pediste)
  const final_hospital_destino = requirio_traslado ? hospital_destino : null;
  const final_id_estado_traslado = !requirio_traslado ? id_estado_traslado : null;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 3. Insertar en 'activaciones' (actualizado con los nuevos campos)
    const activacionQuery = `
      INSERT INTO activaciones (
        fecha_activacion, hora_activacion, origen_reporte, num_reporte_externo, 
        requirio_traslado, hospital_destino, paciente_nombre, paciente_edad, 
        paciente_sexo, causa_clinica_especifica, ct_especifico, id_tipo_activacion, 
        id_unidad_asignada, id_causa_clinica, id_agente_causante_general, id_estado_traslado,
        tipo_activacion_otro -- <-- ¡NUEVA COLUMNA!
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id, num_reporte_local;
    `;
    
    // 4. Valores para el INSERT (actualizados)
    const activacionValues = [
      fecha_activacion, hora_activacion,
      origen_reporte || 'Local', num_reporte_externo,
      requirio_traslado, final_hospital_destino, // <-- Lógica de traslado aplicada
      paciente_nombre, paciente_edad,
      paciente_sexo, causa_clinica_especifica, ct_especifico,
      id_tipo_activacion, id_unidad_asignada, id_causa_clinica,
      id_agente_causante_general, final_id_estado_traslado, // <-- Lógica de traslado aplicada
      tipo_activacion_otro // <-- ¡NUEVO VALOR!
    ];
    
    const nuevaActivacionResult = await client.query(activacionQuery, activacionValues);
    const nuevaActivacion = nuevaActivacionResult.rows[0];
    const nuevaActivacionId = nuevaActivacion.id;

    // 5. Insertar causas traumáticas (si existen)
    if (id_causas_traumaticas && id_causas_traumaticas.length > 0) {
      const causaTraumaticaQuery = 'INSERT INTO activacion_causas_traumaticas (id_activacion, id_causa_traumatica_especifica) VALUES ($1, $2)';
      for (const id_causa of id_causas_traumaticas) {
        await client.query(causaTraumaticaQuery, [nuevaActivacionId, id_causa]);
      }
    }

    // 6. Insertar evaluación clínica (si existe)
    if (evaluacion && (evaluacion.id_estado_pupilas || evaluacion.id_estado_piel)) {
      const evaluacionQuery = `
        INSERT INTO evaluacion_clinica (id_activacion, anisocoria_lado, id_estado_pupilas, id_estado_piel)
        VALUES ($1, $2, $3, $4);
      `;
      await client.query(evaluacionQuery, [
        nuevaActivacionId,
        evaluacion.anisocoria_lado || null,
        evaluacion.id_estado_pupilas || null,
        evaluacion.id_estado_piel || null
      ]);
    }

    // 7. Insertar lesiones (¡AHORA SÍ SE GUARDAN!)
    if (lesiones && lesiones.length > 0) {
      const lesionQuery = `
        INSERT INTO lesiones_activacion (id_activacion, descripcion_lesion, id_tipo_lesion, id_ubicacion_lesion)
        VALUES ($1, $2, $3, $4);
      `;
      for (const lesion of lesiones) {
        // Solo guardar si la lesión tiene al menos un dato
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

// Endpoint para OBTENER activaciones (AHORA CON FILTROS)
app.get('/api/activaciones', async (req, res) => {
  // Leemos los posibles filtros de la URL (scope, fecha_inicio, fecha_fin)
  const { scope, fecha_inicio, fecha_fin } = req.query;

  try {
    let query = `
      SELECT 
        a.id,
        a.num_reporte_local,
        a.fecha_activacion,
        a.hora_activacion,
        a.paciente_nombre,
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

    // Lógica de filtros
    if (scope === 'today') {
      // Para la tabla de "Registros del Día"
      query += ' WHERE a.fecha_activacion = CURRENT_DATE ';
    } else if (fecha_inicio && fecha_fin) {
      // Para la nueva vista de "Consultas"
      values.push(fecha_inicio, fecha_fin);
      query += ' WHERE a.fecha_activacion BETWEEN $1 AND $2 ';
    }
    // Si no hay filtros, simplemente trae todo

    query += ' ORDER BY a.fecha_activacion DESC, a.hora_activacion DESC;';

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (err) {
    console.error('Error al obtener las activaciones:', err);
    res.status(500).json({ error: 'Error interno al consultar los registros.' });
  }
});


// 6. Iniciar Servidor (Sin cambios)
app.listen(PORT, () => {
  console.log(`✅ Servidor backend corriendo en http://localhost:${PORT}`);
});