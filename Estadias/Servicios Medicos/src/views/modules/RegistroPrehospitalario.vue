<template>
  <div>
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="page-actions">
        <button @click="toggleFormVisibility" class="btn btn-outline-secondary">
          <i :class="showForm ? 'fas fa-arrow-left' : 'fas fa-plus'"></i>
          <b class="ms-2">{{ showForm ? 'Volver' : 'Nuevo Registro' }}</b>
        </button>
      </div>
    </div>

    <div class="main-content">
      <div v-if="showForm">
        <div class="form-header">
          <h2>Nuevo Registro de Atención Prehospitalaria</h2>
          <p class="text-muted">La fecha y hora se guardan automáticamente.</p>
        </div>
        
        <div v-if="mensaje" :class="['alert', tipoMensaje]">
          {{ mensaje }}
        </div>
        
        <form @submit.prevent="registrarActivacion" class="form-grid">
          
          <div class="form-section card-light">
            <h3 class="section-title"><i class="fas fa-file-invoice icon-title"></i>Datos de Activación</h3>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Fecha de Activación</label>
                <input type="date" :value="currentDate" class="form-control" disabled>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Hora de Activación</label>
                <input type="time" :value="currentTime" class="form-control" disabled>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Tipo de Activación *</label>
                <select v-model="formulario.id_tipo_activacion" class="form-select" required>
                  <option :value="null" disabled>Seleccione una opción</option>
                  <option v-for="tipo in catalogos.tipos_activacion" :key="tipo.id" :value="tipo.id">
                    {{ tipo.nombre }}
                  </option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Unidad Asignada</label>
                <select v-model="formulario.id_unidad_asignada" class="form-select">
                  <option :value="null">Seleccione una unidad</option>
                  <option v-for="unidad in catalogos.unidades" :key="unidad.id" :value="unidad.id">
                    {{ unidad.nombre }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" v-model="tieneReporteExterno" id="checkReporteExterno">
              <label class="form-check-label" for="checkReporteExterno">¿Tiene reporte externo? (C5, Cruz Roja, etc.)</label>
            </div>
            <div v-if="tieneReporteExterno" class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Origen Reporte Externo</label>
                <select v-model="formulario.origen_reporte" class="form-select">
                  <option value="C5">C5</option>
                  <option value="R">Cruz Roja</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Número Reporte Externo</label>
                <input type="text" v-model="formulario.num_reporte_externo" class="form-control" placeholder="Ej: C5-12345">
              </div>
            </div>
          </div>

          <div class="form-section card-light">
            <h3 class="section-title"><i class="fas fa-pills icon-title"></i>Causa del Servicio</h3>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Causa Clínica</label>
                <select v-model="formulario.id_causa_clinica" class="form-select">
                    <option :value="null">Seleccione (si aplica)</option>
                    <option v-for="causa in catalogos.causa_clinica" :key="causa.id" :value="causa.id">
                        {{ causa.nombre }}
                    </option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Agente Causal General</label>
                 <select v-model="formulario.id_agente_causante_general" class="form-select">
                    <option :value="null">Seleccione (si aplica)</option>
                    <option v-for="agente in catalogos.agentes_causantes" :key="agente.id" :value="agente.id">
                        {{ agente.nombre }}
                    </option>
                </select>
              </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Causas Traumáticas</label>
                <div class="checkbox-group">
                    <div v-for="causa in catalogos.causas_traumaticas" :key="causa.id" class="form-check">
                        <input class="form-check-input" type="checkbox" :value="causa.id" v-model="formulario.id_causas_traumaticas">
                        <label class="form-check-label">{{ causa.nombre }}</label>
                    </div>
                </div>
            </div>
          </div>
          
          <div class="form-section card-light">
            <h3 class="section-title"><i class="fas fa-user-injured icon-title"></i>Datos del Paciente</h3>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Nombre completo *</label>
                <input type="text" v-model="formulario.paciente_nombre" class="form-control" placeholder="Ej: Juan Pérez" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Edad</label>
                <input type="number" v-model="formulario.paciente_edad" class="form-control" placeholder="Ej: 35" min="0" max="120">
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
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

          <div class="form-section card-light">
            <h3 class="section-title"><i class="fas fa-ambulance icon-title"></i>Traslado</h3>
             <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" v-model="formulario.requirio_traslado" id="checkTraslado">
              <label class="form-check-label" for="checkTraslado">¿Requirió traslado?</label>
            </div>
            <div class="row" v-if="formulario.requirio_traslado">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Estado del Traslado</label>
                    <select v-model="formulario.id_estado_traslado" class="form-select">
                        <option :value="null">Seleccione estado</option>
                        <option v-for="op in catalogos.estados_traslado" :key="op.id" :value="op.id">{{ op.nombre }}</option>
                    </select>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Hospital Destino</label>
                    <input type="text" v-model="formulario.hospital_destino" class="form-control" placeholder="Nombre del hospital">
                </div>
            </div>
          </div>


          <div class="text-center mt-4">
            <button type="submit" class="btn btn-primary btn-lg">
              <i class="fas fa-save me-2"></i><b>Guardar Registro</b>
            </button>
          </div>
        </form>
      </div>

      <div v-else>
        <!-- Aquí puedes poner el contenido alternativo que desees mostrar cuando showForm es false -->
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
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
    const tieneReporteExterno = ref(false);
    const showForm = ref(true); // si ya existe, no la vuelvas a definir
    const pageTitle = computed(() => (showForm.value ? 'Registro Prehospitalario' : 'Lista de Registros'));

    const currentDate = computed(() => new Date().toISOString().split('T')[0]);
    const currentTime = computed(() => new Date().toTimeString().split(' ')[0].substring(0, 5));

    const toggleFormVisibility = () => {
      showForm.value = !showForm.value;
    };

    onMounted(async () => {
      try {
        const res = await api.get('/catalogos');
        // usar defensivamente: puede venir en res.data o res.data.data
        const d = res.data?.data || res.data || {};
        catalogos.value = {
          tipos_activacion: d.tipos_activacion || d.tipos || [],
          causa_clinica: d.causa_clinica || [],
          causas_traumaticas: d.causas_traumaticas || [],
          agentes_causantes: d.agentes_causantes || [],
          unidades: d.unidades || [],
          estados_traslado: d.estados_traslado || []
        };
      } catch (err) {
        console.error('Error cargando catálogos', err);
        mensaje.value = 'No se pudieron cargar las listas. Intente nuevamente.';
        tipoMensaje.value = 'alert-danger';
      }
    });

    const registrarActivacion = async () => {
      try {
        const payload = { ...formulario.value, fecha_activacion: currentDate.value, hora_activacion: currentTime.value };
        console.log('Payload a enviar:', payload);
        const resp = await api.post('/activaciones', payload);
        mensaje.value = `Registro guardado con folio: ${resp.data.data.num_reporte_local}`;
        tipoMensaje.value = 'alert-success';
        // Opcional: Reiniciar el formulario después de guardar
        resetFormulario();
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Intente nuevamente.';
        mensaje.value = `Error al guardar: ${errorMsg}`;
        tipoMensaje.value = 'alert-danger';
      }
    };

    const resetFormulario = () => {
      formulario.value = {
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
        id_causas_traumaticas: []
      };
      mensaje.value = '';
      tipoMensaje.value = '';
      tieneReporteExterno.value = false;
    };

    watch(tieneReporteExterno, (nv) => {
      if (!nv) {
        formulario.value.origen_reporte = 'Local';
        formulario.value.num_reporte_externo = '';
      } else {
        formulario.value.origen_reporte = 'C5';
      }
    });

    return {
      formulario,
      catalogos,
      mensaje,
      tipoMensaje,
      tieneReporteExterno,
      showForm,
      pageTitle,
      toggleFormVisibility,
      currentDate,
      currentTime,
      registrarActivacion,
      resetFormulario // si la tienes
    };
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-title {
  margin: 0;
  font-size: 28px;
  color: #0d6efd;
}

.page-actions {
  display: flex;
  align-items: center;
}

.page-actions .btn {
  margin-left: 10px;
}

.form-header {
  text-align: center;
  margin-bottom: 20px;
}

.form-header h2 {
  margin: 0;
  font-size: 28px;
}

.form-header p {
  margin: 5px 0 0;
  color: #666;
}

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
  display: flex;
  align-items: center;
}

.icon-title {
  font-size: 18px;
  margin-right: 10px;
  color: #0d6efd;
}

.form-label {
  font-weight: 500;
  margin-bottom: 10px;
}

.form-control, .form-select {
  border-radius: 5px;
  padding: 10px;
  font-size: 16px;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
  padding: 10px 20px;
  font-size: 18px;
  border-radius: 5px;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0b5ed7;
}

.alert {
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.checkbox-group {
  padding-left: 20px;
}

.checkbox-group .form-check {
  margin-bottom: 10px;
}
</style>