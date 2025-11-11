// 1. Importaciones
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 2. Configuración del Servidor
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
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

// Verificar conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos PostgreSQL', err);
  } else {
    console.log('🚀 Conectado a la base de datos PostgreSQL en:', res.rows[0].now);
  }
});

// 4. Autenticación
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
            res.json({
                id: user.id,
                username: user.nombre_usuario,
                name: user.nombre_completo,
                rol: user.rol,
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

// 5. Endpoint para obtener todos los catálogos (ACTUALIZADO CON EVENTOS)
app.get('/api/catalogos', async (req, res) => {
  try {
    const [
      // Catálogos originales de activaciones
      tipos_activacion, causa_clinica, agentes_causantes,
      causas_traumaticas, unidades, estados_traslado,
      estados_pupilas, estados_piel, tipos_lesion, ubicaciones_lesion,
      
      // Nuevos catálogos para eventos
      tipos_evento, categorias_evento, personal, unidades_transporte
    ] = await Promise.all([
      // Consultas originales
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
      
      // Nuevas consultas para eventos
      pool.query('SELECT * FROM tipo_evento ORDER BY id'),
      pool.query('SELECT * FROM categoria_evento ORDER BY id'),
      pool.query('SELECT id, nombre_completo AS nombre FROM usuarios ORDER BY nombre_completo'),
      pool.query('SELECT id, nombre AS codigo, nombre AS descripcion FROM unidad_asignada ORDER BY nombre')
    ]);

    res.json({
      // Catálogos originales
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
      
      // Nuevos catálogos para eventos
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

// --- RUTAS PARA ACTIVACIONES (TUS RUTAS ORIGINALES) ---

app.post('/api/activaciones', async (req, res) => {
  const {
    fecha_activacion, hora_activacion, origen_reporte, num_reporte_externo, 
    requirio_traslado = false, hospital_destino, paciente_nombre, paciente_edad = null, 
    paciente_sexo, causa_clinica_especifica, ct_especifico, id_tipo_activacion, 
    id_unidad_asignada = null, id_causa_clinica = null, id_causas_traumaticas = [], 
    id_agente_causante_general = null, id_estado_traslado = null, tipo_activacion_otro,
    evaluacion = {}, lesiones = []
  } = req.body;

  const final_hospital_destino = requirio_traslado ? hospital_destino : null;
  const final_id_estado_traslado = !requirio_traslado ? id_estado_traslado : null;

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
      fecha_activacion, hora_activacion,
      origen_reporte || 'Local', num_reporte_externo,
      requirio_traslado, final_hospital_destino, 
      paciente_nombre, paciente_edad,
      paciente_sexo, causa_clinica_especifica, ct_especifico,
      id_tipo_activacion, id_unidad_asignada, id_causa_clinica,
      id_agente_causante_general, final_id_estado_traslado,
      tipo_activacion_otro
    ];
    
    const nuevaActivacionResult = await client.query(activacionQuery, activacionValues);
    const nuevaActivacion = nuevaActivacionResult.rows[0];
    const nuevaActivacionId = nuevaActivacion.id;

    if (id_causas_traumaticas && id_causas_traumaticas.length > 0) {
      const causaTraumaticaQuery = 'INSERT INTO activacion_causas_traumaticas (id_activacion, id_causa_traumatica_especifica) VALUES ($1, $2)';
      for (const id_causa of id_causas_traumaticas) {
        await client.query(causaTraumaticaQuery, [nuevaActivacionId, id_causa]);
      }
    }

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

    if (lesiones && lesiones.length > 0) {
      const lesionQuery = `
        INSERT INTO lesiones_activacion (id_activacion, descripcion_lesion, id_tipo_lesion, id_ubicacion_lesion)
        VALUES ($1, $2, $3, $4);
      `;
      for (const lesion of lesiones) {
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

app.get('/api/activaciones', async (req, res) => {
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

app.get('/api/activaciones/:id', async (req, res) => {
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

app.put('/api/activaciones/:id', async (req, res) => {
  const { id } = req.params;
  
  const {
    fecha_activacion, hora_activacion, origen_reporte, num_reporte_externo, 
    requirio_traslado = false, hospital_destino, paciente_nombre, paciente_edad = null, 
    paciente_sexo, causa_clinica_especifica, ct_especifico, id_tipo_activacion, 
    id_unidad_asignada = null, id_causa_clinica = null, id_causas_traumaticas = [], 
    id_agente_causante_general = null, id_estado_traslado = null, tipo_activacion_otro,
    evaluacion = {}, lesiones = []
  } = req.body;

  const final_hospital_destino = requirio_traslado ? hospital_destino : null;
  const final_id_estado_traslado = !requirio_traslado ? id_estado_traslado : null;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const activacionQuery = `
      UPDATE activaciones SET
        fecha_activacion = $1,
        hora_activacion = $2,
        origen_reporte = $3,
        num_reporte_externo = $4,
        requirio_traslado = $5,
        hospital_destino = $6,
        paciente_nombre = $7,
        paciente_edad = $8,
        paciente_sexo = $9,
        causa_clinica_especifica = $10,
        ct_especifico = $11,
        id_tipo_activacion = $12,
        id_unidad_asignada = $13,
        id_causa_clinica = $14,
        id_agente_causante_general = $15,
        id_estado_traslado = $16,
        tipo_activacion_otro = $17
      WHERE id = $18
      RETURNING num_reporte_local;
    `;
    
    const activacionValues = [
      fecha_activacion, hora_activacion,
      origen_reporte || 'Local', num_reporte_externo,
      requirio_traslado, final_hospital_destino,
      paciente_nombre, paciente_edad,
      paciente_sexo, causa_clinica_especifica, ct_especifico,
      id_tipo_activacion, id_unidad_asignada, id_causa_clinica,
      id_agente_causante_general, final_id_estado_traslado,
      tipo_activacion_otro,
      id
    ];
    
    const updateResult = await client.query(activacionQuery, activacionValues);
    const updatedFolio = updateResult.rows[0].num_reporte_local;

    await client.query('DELETE FROM activacion_causas_traumaticas WHERE id_activacion = $1', [id]);
    if (id_causas_traumaticas && id_causas_traumaticas.length > 0) {
      const causaTraumaticaQuery = 'INSERT INTO activacion_causas_traumaticas (id_activacion, id_causa_traumatica_especifica) VALUES ($1, $2)';
      for (const id_causa of id_causas_traumaticas) {
        await client.query(causaTraumaticaQuery, [id, id_causa]);
      }
    }

    await client.query('DELETE FROM evaluacion_clinica WHERE id_activacion = $1', [id]);
    if (evaluacion && (evaluacion.id_estado_pupilas || evaluacion.id_estado_piel)) {
      const evaluacionQuery = `
        INSERT INTO evaluacion_clinica (id_activacion, anisocoria_lado, id_estado_pupilas, id_estado_piel)
        VALUES ($1, $2, $3, $4);
      `;
      await client.query(evaluacionQuery, [
        id,
        evaluacion.anisocoria_lado || null,
        evaluacion.id_estado_pupilas || null,
        evaluacion.id_estado_piel || null
      ]);
    }
    
    await client.query('DELETE FROM lesiones_activacion WHERE id_activacion = $1', [id]);
    if (lesiones && lesiones.length > 0) {
      const lesionQuery = `
        INSERT INTO lesiones_activacion (id_activacion, descripcion_lesion, id_tipo_lesion, id_ubicacion_lesion)
        VALUES ($1, $2, $3, $4);
      `;
      for (const lesion of lesiones) {
        if (lesion.id_tipo_lesion || lesion.id_ubicacion_lesion || (lesion.descripcion_lesion && lesion.descripcion_lesion.trim() !== '')) {
            await client.query(lesionQuery, [
              id,
              lesion.descripcion_lesion,
              lesion.id_tipo_lesion,
              lesion.id_ubicacion_lesion
            ]);
        }
      }
    }

    await client.query('COMMIT');

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

// --- RUTAS PARA EVENTOS (NUEVAS RUTAS DE TU COMPAÑERO) ---

app.post('/api/eventos', async (req, res) => {
  console.log('📨 RECIBIENDO PETICIÓN POST /api/eventos');
  const {
    nombre_evento, id_tipo_evento, id_categoria, fecha, hora_inicio, hora_fin,
    estado, lugar, direccion, organizador, institucion_responsable, 
    participantes_esperados, ambulancias_asignadas, personal_medico, 
    personal_apoyo, objetivos, descripcion, id_responsable, 
    observaciones, lecciones_aprendidas, observaciones_unidades,
    personal_participante_ids,
    unidades_atienden
  } = req.body;

  const camposObligatorios = [
    { campo: 'nombre_evento', valor: nombre_evento },
    { campo: 'fecha', valor: fecha },
    { campo: 'hora_inicio', valor: hora_inicio },
    { campo: 'lugar', valor: lugar },
    { campo: 'id_tipo_evento', valor: id_tipo_evento }
  ];

  const camposFaltantes = camposObligatorios.filter(item => 
    item.valor === undefined || item.valor === null || item.valor === ''
  );

  if (camposFaltantes.length > 0) {
    console.error('❌ CAMPOS OBLIGATORIOS FALTANTES:', camposFaltantes);
    return res.status(400).json({ 
      error: 'Faltan campos obligatorios',
      detalles: 'Verifique que los campos obligatorios estén completos.'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('📝 Iniciando transacción para evento:', nombre_evento);

    const eventoQuery = `
      INSERT INTO eventos (
        nombre_evento, id_tipo_evento, id_categoria, fecha, hora_inicio, hora_fin,
        estado, lugar, direccion, organizador, institucion_responsable, 
        participantes_esperados, ambulancias_asignadas, personal_medico, 
        personal_apoyo, objetivos, descripcion, id_responsable, 
        observaciones, lecciones_aprendidas, observaciones_unidades
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 
        $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )
      RETURNING id, nombre_evento;
    `;
    
    const eventoValues = [
      nombre_evento, 
      id_tipo_evento, 
      id_categoria || null, 
      fecha, 
      hora_inicio, 
      hora_fin || null,
      estado || 'planificado', 
      lugar, 
      direccion || null, 
      organizador || null, 
      institucion_responsable || null, 
      participantes_esperados || null, 
      ambulancias_asignadas || null, 
      personal_medico || null, 
      personal_apoyo || null, 
      objetivos || null, 
      descripcion || null, 
      id_responsable || null, 
      observaciones || null, 
      lecciones_aprendidas || null, 
      observaciones_unidades || null
    ];
    
    const nuevoEventoResult = await client.query(eventoQuery, eventoValues);
    const nuevoEventoId = nuevoEventoResult.rows[0].id;
    
    console.log('✅ Evento principal creado con ID:', nuevoEventoId);

    if (personal_participante_ids && personal_participante_ids.length > 0) {
      console.log('🔍 IDs de Personal a insertar:', personal_participante_ids);
      const personalQuery = 'INSERT INTO evento_personal (id_evento, id_usuario) VALUES ($1, $2)';
      for (const id_usuario of personal_participante_ids) {
        await client.query(personalQuery, [nuevoEventoId, id_usuario]);
      }
      console.log('✅ Personal participante insertado');
    }

    if (unidades_atienden && unidades_atienden.length > 0) {
      console.log('🔍 Unidades a insertar:', unidades_atienden);
      
      const getUnitIdsQuery = `SELECT id FROM unidad_asignada WHERE nombre = ANY($1::text[])`; 
      
      const unitIdsResult = await client.query(getUnitIdsQuery, [unidades_atienden]);
      const unitIds = unitIdsResult.rows.map(row => row.id);
      
      console.log('🔍 IDs de unidad_asignada encontrados para insertar en evento_unidades:', unitIds);

      if (unitIds.length > 0) {
        const unidadesQuery = 'INSERT INTO evento_unidades (id_evento, id_unidad_transporte) VALUES ($1, $2)'; 
        for (const id_unidad of unitIds) {
          await client.query(unidadesQuery, [nuevoEventoId, id_unidad]);
        }
        console.log('✅ Unidades asignadas insertadas');
      }
    }

    await client.query('COMMIT');
    console.log('🎉 Transacción completada exitosamente');

    res.status(201).json({ 
      message: 'Evento registrado exitosamente',
      data: nuevoEventoResult.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error en la transacción de eventos:', err);
    console.error('Código de Error SQL:', err.code);
    
    let errorMessage = 'Error al guardar el evento. No se guardó ningún dato.';
    
    if (err.code === '23503') {
      errorMessage = 'Error: Referencia de ID inválida (Tipo, Categoría, Responsable o Unidad seleccionados no existen en la BD).';
    } else if (err.code === '23502') {
      errorMessage = 'Error: Faltan campos obligatorios en la base de datos (NOT NULL violation).';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
});

app.get('/api/eventos', async (req, res) => {
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
    console.error('Código de Error SQL:', err.code); 
    res.status(500).json({ error: 'Error interno al consultar los eventos.' });
  }
});

app.get('/api/eventos/:id', async (req, res) => {
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

        res.json(result.rows[0]);

    } catch (err) {
        console.error(`❌ Error al obtener detalles del evento ${id}:`, err);
        res.status(500).json({ error: 'Error interno al consultar el evento.' });
    }
});

app.put('/api/eventos/:id', async (req, res) => {
    const { id } = req.params;
    
    const {
        nombre_evento, id_tipo_evento, id_categoria, fecha, hora_inicio, hora_fin,
        estado, lugar, direccion, organizador, institucion_responsable, 
        participantes_esperados, ambulancias_asignadas, personal_medico, 
        personal_apoyo, objetivos, descripcion, id_responsable, 
        observaciones, lecciones_aprendidas, observaciones_unidades,
        personal_participante_ids,
        unidades_atienden
    } = req.body;

    const camposObligatorios = [
        { campo: 'nombre_evento', valor: nombre_evento },
        { campo: 'fecha', valor: fecha },
        { campo: 'hora_inicio', valor: hora_inicio },
        { campo: 'lugar', valor: lugar },
        { campo: 'id_tipo_evento', valor: id_tipo_evento }
    ];

    const camposFaltantes = camposObligatorios.filter(item => 
        item.valor === undefined || item.valor === null || item.valor === ''
    );

    if (camposFaltantes.length > 0) {
        return res.status(400).json({ 
            error: 'Faltan campos obligatorios',
            camposFaltantes: camposFaltantes.map(item => item.campo)
        });
    }

    const client = await pool.connect();

    try {
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
            nombre_evento, id_tipo_evento, id_categoria || null, fecha, hora_inicio, hora_fin || null,
            estado || 'planificado', lugar, direccion || null, organizador || null, 
            institucion_responsable || null, participantes_esperados || null, ambulancias_asignadas || null, 
            personal_medico || null, personal_apoyo || null, objetivos || null, descripcion || null, 
            id_responsable || null, observaciones || null, lecciones_aprendidas || null, 
            observaciones_unidades || null, id
        ];

        const result = await client.query(eventoUpdateQuery, eventoUpdateValues);
        
        if (result.rows.length === 0) {
            throw new Error("Evento no encontrado para actualizar.");
        }

        await client.query('DELETE FROM evento_personal WHERE id_evento = $1', [id]);

        if (personal_participante_ids && personal_participante_ids.length > 0) {
            const personalQuery = 'INSERT INTO evento_personal (id_evento, id_usuario) VALUES ($1, $2)';
            for (const id_usuario of personal_participante_ids) {
                await client.query(personalQuery, [id, id_usuario]);
            }
        }

        await client.query('DELETE FROM evento_unidades WHERE id_evento = $1', [id]);

        if (unidades_atienden && unidades_atienden.length > 0) {
            const getUnitIdsQuery = `SELECT id FROM unidad_asignada WHERE nombre = ANY($1::text[])`; 
            
            const unitIdsResult = await client.query(getUnitIdsQuery, [unidades_atienden]);
            const unitIds = unitIdsResult.rows.map(row => row.id);
            
            if (unitIds.length > 0) {
                const unidadesQuery = 'INSERT INTO evento_unidades (id_evento, id_unidad_transporte) VALUES ($1, $2)';
                for (const id_unidad of unitIds) {
                    await client.query(unidadesQuery, [id, id_unidad]);
                }
            }
        }

        await client.query('COMMIT');

        res.status(200).json({
            message: 'Evento actualizado exitosamente',
            data: result.rows[0]
        });

    } catch (err) {
        await client.query('ROLLBACK');
        
        let errorMessage = 'Error al actualizar el evento';
        if (err.code === '23503') {
            errorMessage = 'Error: Referencia de ID inválida (Tipo, Categoría, Responsable o Unidad seleccionados no existen).';
        } else if (err.code === '23502') {
            errorMessage = 'Error: Faltan campos obligatorios en la base de datos.';
        } else if (err.message.includes('Evento no encontrado')) {
            errorMessage = 'Error: El evento no existe';
        }
        
        res.status(500).json({ 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } finally {
        client.release();
    }
});

app.delete('/api/eventos/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({ error: 'ID de evento requerido para eliminar.' });
    }

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        const deleteQuery = 'DELETE FROM eventos WHERE id = $1 RETURNING id;';
        
        const result = await client.query(deleteQuery, [id]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Evento no encontrado.' });
        }

        await client.query('COMMIT');
        console.log(`✅ Evento ID: ${id} eliminado exitosamente.`);

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

// 6. Iniciar Servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor backend unificado corriendo en http://localhost:${PORT}`);
  console.log(`📋 Módulos disponibles: Activaciones + Eventos/Simulacros`);
});