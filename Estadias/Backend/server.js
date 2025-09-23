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

// Endpoint para crear una nueva activación (Versión simplificada para empezar)
app.post('/api/activaciones', async (req, res) => {
  // Obtenemos todos los datos del formulario, incluyendo el nuevo arreglo
  const {
    fecha_activacion, hora_activacion, origen_reporte,
    num_reporte_externo, requirio_traslado, hospital_destino,
    paciente_nombre, paciente_edad, paciente_sexo,
    id_tipo_activacion, id_unidad_asignada, id_causa_clinica,
    id_causas_traumaticas // ¡Aquí viene nuestro nuevo arreglo!
  } = req.body;

  // Pedimos una conexión a la base de datos para manejar la transacción
  const client = await pool.connect();

  try {
    // ---- Inicia la "caja de seguridad" ----
    await client.query('BEGIN');

    // 1. Guardamos los datos principales en la tabla 'activaciones'
    //    y le pedimos que nos devuelva el 'id' y el 'num_reporte_local' del nuevo registro.
    const activacionQuery = `
      INSERT INTO activaciones (
        fecha_activacion, hora_activacion, origen_reporte, num_reporte_externo, 
        requirio_traslado, hospital_destino, paciente_nombre, paciente_edad, 
        paciente_sexo, id_tipo_activacion, id_unidad_asignada, id_causa_clinica
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, num_reporte_local;
    `;
    const activacionValues = [
      fecha_activacion, hora_activacion, origen_reporte, num_reporte_externo,
      requirio_traslado, hospital_destino, paciente_nombre, paciente_edad,
      paciente_sexo, id_tipo_activacion, id_unidad_asignada, id_causa_clinica
    ];
    
    const nuevaActivacionResult = await client.query(activacionQuery, activacionValues);
    const nuevaActivacion = nuevaActivacionResult.rows[0];
    const nuevaActivacionId = nuevaActivacion.id; // ¡Este es el ID que necesitamos!

    // 2. Revisamos si el arreglo 'id_causas_traumaticas' tiene algo
    if (id_causas_traumaticas && id_causas_traumaticas.length > 0) {
      const causaTraumaticaQuery = 'INSERT INTO activacion_causas_traumaticas (id_activacion, id_causa_traumatica_especifica) VALUES ($1, $2)';
      
      // Hacemos un bucle y guardamos una por una cada causa seleccionada
      for (const id_causa of id_causas_traumaticas) {
        await client.query(causaTraumaticaQuery, [nuevaActivacionId, id_causa]);
      }
    }

    // ---- Si todo salió bien, cerramos la "caja de seguridad" y guardamos los cambios ----
    await client.query('COMMIT');

    res.status(201).json({ 
      message: 'Activación registrada exitosamente',
      data: nuevaActivacion 
    });

  } catch (err) {
    // ---- Si algo falló, deshacemos todos los cambios ----
    await client.query('ROLLBACK');
    console.error('Error en la transacción:', err);
    res.status(500).json({ error: 'Error al guardar el registro. No se guardó ningún dato.' });
  } finally {
    // Liberamos la conexión para que otros la puedan usar
    client.release();
  }
});

app.get('/api/activaciones', async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id,
        a.num_reporte_local,
        a.fecha_activacion,
        a.paciente_nombre,
        ta.nombre AS tipo_activacion,
        cc.nombre AS causa_clinica
      FROM 
        activaciones AS a
      LEFT JOIN 
        tipo_activacion AS ta ON a.id_tipo_activacion = ta.id
      LEFT JOIN 
        causa_clinica AS cc ON a.id_causa_clinica = cc.id
      ORDER BY 
        a.fecha_activacion DESC, a.hora_activacion DESC;
    `;

    const result = await pool.query(query);

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