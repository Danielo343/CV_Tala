  <template>
    <div class="container mt-4">
      <h2>Nuevo Registro de Atención Prehospitalaria</h2>
      
      <div v-if="mensaje" :class="['alert', tipoMensaje]">
        {{ mensaje }}
      </div>
      
      <form @submit.prevent="registrarActivacion" class="form-section">
        
        <div class="form-section">
          <h3 class="section-title">Activación</h3>
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label">Fecha de Activación *</label>
              <input type="date" v-model="formulario.fecha_activacion" class="form-control" required>
            </div>
            <div class="col-md-6">
              <label class="form-label">Hora de Activación *</label>
              <input type="time" v-model="formulario.hora_activacion" class="form-control" required>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Tipo de Activación *</label>
            <select v-model="formulario.id_tipo_activacion" class="form-select" required>
              <option :value="null">Seleccione una opción</option>
              <option v-for="tipo in catalogos.tipos_activacion" :key="tipo.id" :value="tipo.id">
                {{ tipo.nombre }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">Causa Clínica</h3>
          <div class="mb-3">
            <select v-model="formulario.id_causa_clinica" class="form-select">
              <option :value="null">Seleccione causa clínica (si aplica)</option>
              <option v-for="causa in catalogos.causa_clinica" :key="causa.id" :value="causa.id">
                {{ causa.nombre }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="form-section">
           <h3 class="section-title">Causa Traumática (Selecciona todas las que apliquen)</h3>
          <div class="checkbox-group">
          <div v-for="causa in catalogos.causas_traumaticas" :key="causa.id" class="form-check">
          <input class="form-check-input" type="checkbox" :value="causa.id" v-model="formulario.id_causas_traumaticas">
          <label class="form-check-label">{{ causa.nombre }}</label>
          </div>
          </div>
      </div>

        <div class="form-section">
          <h3 class="section-title">Datos del Paciente</h3>
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label">Nombre completo *</label>
              <input type="text" v-model="formulario.paciente_nombre" class="form-control" required>
            </div>
            <div class="col-md-6">
              <label class="form-label">Edad</label>
              <input type="number" v-model="formulario.paciente_edad" class="form-control" min="0" max="120">
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <label class="form-label">Sexo</label>
              <select v-model="formulario.paciente_sexo" class="form-select">
                <option value="">Seleccione</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>
          </div>
        </div>

        <div class="text-center">
          <button type="submit" class="btn btn-primary btn-lg">Guardar Registro</button>
        </div>
      </form>
    </div>
  </template>

  <script>
  // El script que te pasé antes ya está adaptado para esto.
  // Lo vuelvo a poner aquí para que tengas todo junto.
  import { ref, onMounted } from 'vue';
  import api from '@/services/api';

  export default {
    name: 'RegistroForm',
    setup() {
      const catalogos = ref({
        tipos_activacion: [],
        causa_clinica: [],
        unidades: [],
        // etc.
      });

      const formulario = ref({
        fecha_activacion: new Date().toISOString().split('T')[0],
        hora_activacion: new Date().toTimeString().split(' ')[0].substring(0, 5),
        origen_reporte: 'Local',
        num_reporte_externo: '',
        requirio_traslado: false,
        hospital_destino: '',
        paciente_nombre: '',
        paciente_edad: null,
        paciente_sexo: '',
        id_tipo_activacion: null,
        id_unidad_asignada: null,
        id_causa_clinica: null,
        id_causas_traumaticas: [] // Array para múltiples selecciones
      });

      const mensaje = ref('');
      const tipoMensaje = ref('');

      onMounted(async () => {
        try {
          const response = await api.get('/catalogos');
          catalogos.value = response.data;
        } catch (error) {
          console.error('Error al cargar los catálogos:', error);
          mensaje.value = 'No se pudieron cargar las opciones del formulario.';
          tipoMensaje.value = 'alert-danger';
        }
      });

      const registrarActivacion = async () => {
        try {
          const response = await api.post('/activaciones', formulario.value);
          mensaje.value = `Registro guardado con folio: ${response.data.data.num_reporte_local}`;
          tipoMensaje.value = 'alert-success';
        } catch (error) {
          const errorMsg = error.response?.data?.error || 'Intente nuevamente.';
          mensaje.value = `Error al guardar: ${errorMsg}`;
          tipoMensaje.value = 'alert-danger';
        }
      };

      return {
        formulario,
        catalogos,
        mensaje,
        tipoMensaje,
        registrarActivacion
      };
    }
  }
  </script>

  <style scoped>
  /* Tus estilos CSS se mantienen igual */
  .form-section {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .section-title {
    color: #0d6efd;
    border-bottom: 2px solid #0d6efd;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
  /* ... etc ... */
  </style>