<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="page-actions">
         <button @click="toggleFormVisibility" class="btn btn-primary">
           <i :class="showForm ? 'fas fa-list' : 'fas fa-plus'"></i>
           <b class="ms-2">{{ showForm ? 'Ver Registros del Día' : 'Nuevo Registro' }}</b>
         </button>
      </div>
    </div>

    <div class="main-content">
      <div v-if="showForm">
        <div class="form-header">
          <h2>Nuevo Registro de Atención Prehospitalaria</h2>
          <p class="text-muted">La hora de captura se guarda automáticamente.</p>
        </div>

        <div v-if="mensaje" :class="['alert', tipoMensaje]">
          {{ mensaje }}
        </div>

        <form @submit.prevent="registrarActivacion" class="form-container-stacked">

          <div class="card shadow-sm mb-4 form-section">
            <div class="card-header section-header">
              <h3 class="mb-0"><i class="fas fa-file-invoice me-2"></i>Datos de Activación</h3>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Fecha de Activación  (Hora del evento)</label>
                  <input type="date" v-model="formulario.fecha_activacion" class="form-control" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Hora de Activación  (Hora del evento)</label>
                  <input type="time" v-model="formulario.hora_activacion" class="form-control" required>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tipo de Activación </label>
                  <select v-model="formulario.id_tipo_activacion" class="form-select" required>
                    <option :value="null" disabled>Seleccione una opción</option>
                    <option v-for="tipo in catalogos.tipos_activacion" :key="tipo.id" :value="tipo.id">{{ tipo.nombre }}</option>
                  </select>
                </div>
                
                <div v-if="mostrarOtroTipoActivacion" class="col-md-6 mb-3">
                  <label class="form-label">Especifique "Otro" Tipo Activación</label>
                  <input type="text" v-model="formulario.tipo_activacion_otro" class="form-control" placeholder="Describa el tipo de activación">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Unidad Asignada</label>
                  <select v-model="formulario.id_unidad_asignada" class="form-select">
                    <option :value="null">Seleccione una unidad</option>
                    <option v-for="unidad in catalogos.unidades" :key="unidad.id" :value="unidad.id">{{ unidad.nombre }}</option>
                  </select>
                </div>
              </div>
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" v-model="tieneReporteExterno" id="checkReporteExterno">
                <label class="form-check-label" for="checkReporteExterno">¿Tiene reporte externo? (C5, 911, etc.)</label>
              </div>
              <div v-if="tieneReporteExterno" class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Origen Reporte Externo</label>
                  <select v-model="formulario.origen_reporte" class="form-select">
                    <option value="C5">C5</option>
                    <option value="R">9-1-1</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Número Reporte Externo</label>
                  <input type="text" v-model="formulario.num_reporte_externo" class="form-control" placeholder="Folio C5 o 911">
                </div>
              </div>
              <hr class="my-3">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Fecha de Captura (Automática)</label>
                  <input type="date" :value="currentDate" class="form-control" disabled>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Hora de Captura (Automática)</label>
                  <input type="time" :value="currentTime" class="form-control" disabled>
                </div>
              </div>
            </div>
          </div>

          <div class="card shadow-sm mb-4 form-section">
            <div class="card-header section-header">
              <h3 class="mb-0"><i class="fas fa-stethoscope me-2"></i>Causa del Servicio</h3>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Causa Clínica</label>
                  <select v-model="formulario.id_causa_clinica" class="form-select">
                    <option :value="null">Seleccione (si aplica)</option>
                    <option v-for="causa in catalogos.causa_clinica" :key="causa.id" :value="causa.id">{{ causa.nombre }}</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Agente Causal General</label>
                  <select v-model="formulario.id_agente_causante_general" class="form-select">
                    <option :value="null">Seleccione (si aplica)</option>
                    <option v-for="agente in catalogos.agentes_causantes" :key="agente.id" :value="agente.id">{{ agente.nombre }}</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción Causa Clínica</label>
                <textarea v-model="formulario.causa_clinica_especifica" class="form-control" rows="2" placeholder="Detalles adicionales de la causa clínica..."></textarea>
              </div>
              <hr class="my-3">
              <div class="mb-3">
                <label class="form-label">Causas Traumáticas</label>
                <div class="checkbox-grid">
                  <div v-for="causa in catalogos.causas_traumaticas" :key="causa.id" class="checkbox-item">
                    <input class="form-check-input" type="checkbox" :value="causa.id" v-model="formulario.id_causas_traumaticas" :id="'causa-' + causa.id">
                    <label class="form-check-label" :for="'causa-' + causa.id">{{ causa.nombre }}</label>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción Causa Traumática</label>
                <textarea v-model="formulario.ct_especifico" class="form-control" rows="2" placeholder="Detalles adicionales de la causa traumática..."></textarea>
              </div>
            </div>
          </div>

          <div class="card shadow-sm mb-4 form-section">
            <div class="card-header section-header">
              <h3 class="mb-0"><i class="fas fa-user-injured me-2"></i>Datos del Paciente</h3>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nombre completo </label>
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
                    <option value="O">No definido</option>
                  </select>
                  </div>
              </div>
            </div>
          </div>

          <div class="card shadow-sm mb-4 form-section">
            <div class="card-header section-header">
              <h3 class="mb-0"><i class="fas fa-heart-pulse me-2"></i>Evaluación Clínica</h3>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Estado de Pupilas</label>
                  <select v-model="formulario.evaluacion.id_estado_pupilas" class="form-select">
                    <option :value="null">Seleccione una opción</option>
                    <option v-for="e in catalogos.estados_pupilas" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                  </select>
                </div>
                <div v-if="isAnisocoria" class="col-md-6 mb-3">
                  <label class="form-label">Lado Anisocoria</label>
                  <select v-model="formulario.evaluacion.anisocoria_lado" class="form-select">
                    <option value="Der">Derecho</option>
                    <option value="Izq">Izquierdo</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Estado de la Piel</label>
                  <select v-model="formulario.evaluacion.id_estado_piel" class="form-select">
                    <option :value="null">Seleccione una opción</option>
                    <option v-for="e in catalogos.estados_piel" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="card shadow-sm mb-4 form-section">
            <div class="card-header section-header">
              <h3 class="mb-0"><i class="fas fa-band-aid me-2"></i>Registro de Lesiones</h3>
            </div>
            <div class="card-body">
              <div v-if="formulario.lesiones.length === 0" class="empty-lesion">
                <i class="fas fa-exclamation-circle"></i>
                <p>No se han registrado lesiones.</p>
              </div>
              
              <div v-for="(lesion, index) in formulario.lesiones" :key="index" class="lesion-item">
                <div class="lesion-header">
                  <h4>Lesión #{{ index + 1 }}</h4>
                  <button @click.prevent="eliminarLesion(index)" class="btn btn-sm btn-outline-danger">
                    <i class="fas fa-trash me-1"></i> Quitar
                  </button>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Tipo de Lesión</label>
                    <select v-model="lesion.id_tipo_lesion" class="form-select">
                      <option :value="null">Seleccione tipo</option>
                      <option v-for="t in catalogos.tipos_lesion" :key="t.id" :value="t.id">{{ t.nombre }}</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Ubicación de la Lesión</label>
                    <select v-model="lesion.id_ubicacion_lesion" class="form-select">
                      <option :value="null">Seleccione ubicación</option>
                      <option v-for="u in catalogos.ubicaciones_lesion" :key="u.id" :value="u.id">{{ u.nombre }}</option>
                    </select>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Descripción de la Lesión</label>
                  <textarea v-model="lesion.descripcion_lesion" class="form-control" rows="2" placeholder="Detalles específicos..."></textarea>
                </div>
                </div>
              
              <div class="add-lesion-btn mt-3">
                <button @click.prevent="agregarLesion" class="btn btn-outline-primary">
                  <i class="fas fa-plus me-2"></i> Agregar Lesión
                </button>
              </div>
            </div>
          </div>

          <div class="card shadow-sm mb-4 form-section">
            <div class="card-header section-header">
              <h3 class="mb-0"><i class="fas fa-ambulance me-2"></i>Traslado</h3>
            </div>
            <div class="card-body">
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" v-model="formulario.requirio_traslado" id="checkTraslado">
                <label class="form-check-label" for="checkTraslado">¿Se trasladó?</label>
              </div>
              <div v-if="formulario.requirio_traslado" class="row">
                  <div class="col-md-12 mb-3">
                      <label class="form-label">Hospital Destino </label>
                      <input type="text" v-model="formulario.hospital_destino" class="form-control" placeholder="Nombre del hospital" required>
                  </div>
              </div>
              
              <div v-else class="row">
                  <div class="col-md-12 mb-3">
                      <label class="form-label">Estado del Servicio </label>
                      <select v-model="formulario.id_estado_traslado" class="form-select" required>
                          <option :value="null" disabled>Seleccione estado del servicio</option>
                          <option v-for="op in catalogos.estados_traslado" :key="op.id" :value="op.id">{{ op.nombre }}</option>
                      </select>
                  </div>
              </div>
              </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-lg">
              <i class="fas fa-save me-2"></i>
              <b>Guardar Registro</b>
            </button>
          </div>
        </form>
      </div>

      <div v-else class="p-3">
         <div v-if="cargando" class="text-center p-5">
           <div class="spinner-border text-primary" role="status">
             <span class="visually-hidden">Cargando...</span>
           </div>
           <p class="mt-2">Cargando registros del día...</p>
         </div>
         <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

         <table v-else-if="activaciones.length > 0" class="table table-hover align-middle">
           <thead class="table-light">
             <tr>
               <th>Folio Local</th>
               <th>Fecha Activación</th>
               <th>Paciente</th>
               <th>Tipo de Activación</th>
               <th>Causa Clínica</th>
               <th>Acciones</th>
             </tr>
           </thead>
           <tbody>
             <tr v-for="activacion in activaciones" :key="activacion.id">
               <td><b>{{ activacion.num_reporte_local }}</b></td>
               <td>{{ new Date(activacion.fecha_activacion).toLocaleDateString() }}</td>
               <td>{{ activacion.paciente_nombre }}</td>
               <td><span class="badge bg-secondary">{{ activacion.tipo_activacion || 'N/A' }}</span></td>
               <td>{{ activacion.causa_clinica || 'N/A' }}</td>
               <td>
                 <button class="btn btn-sm btn-outline-primary">Ver Detalles</button>
               </td>
             </tr>
           </tbody>
         </table>

         <div v-else class="empty-state">
           <i class="fas fa-file-excel fa-4x mb-3"></i>
           <h4>No hay registros para el día de hoy</h4>
           <p class="text-muted">Haz clic en "Nuevo Registro" para crear el primero del día.</p>
         </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/services/api';

// Función para inicializar el estado del formulario
const initialFormState = () => ({
  fecha_activacion: new Date().toISOString().split('T')[0],
  hora_activacion: new Date().toTimeString().split(' ')[0].substring(0, 5),
  origen_reporte: 'Local',
  num_reporte_externo: '',
  requirio_traslado: false,
  hospital_destino: '',
  paciente_nombre: '',
  paciente_edad: null,
  paciente_sexo: '',
  causa_clinica_especifica: '',
  ct_especifico: '',
  tipo_activacion_otro: '', // <-- ¡NUEVO CAMPO AÑADIDO!
  id_tipo_activacion: null,
  id_unidad_asignada: null,
  id_causa_clinica: null,
  id_causas_traumaticas: [],
  id_agente_causante_general: null,
  id_estado_traslado: null,
  evaluacion: {
    id_estado_pupilas: null,
    id_estado_piel: null,
    anisocoria_lado: null
  },
  lesiones: []
});

export default {
  name: 'RegistroPrehospitalario',
  setup() {
    const catalogos = ref({});
    const formulario = ref(initialFormState());
    const mensaje = ref('');
    const tipoMensaje = ref('');
    const tieneReporteExterno = ref(false);
    const showForm = ref(false);
    const activaciones = ref([]);
    const cargando = ref(true);
    const error = ref(null);

    const pageTitle = computed(() => (showForm.value ? 'Nuevo Registro Prehospitalario' : 'Registros del Día'));
    // Para mostrar Fecha/Hora de Captura (NO se envían)
    const currentDate = computed(() => new Date().toISOString().split('T')[0]);
    const currentTime = computed(() => new Date().toTimeString().split(' ')[0].substring(0, 5));

    const isAnisocoria = computed(() => {
        const pupilaSeleccionada = catalogos.value.estados_pupilas?.find(p => p.id === formulario.value.evaluacion.id_estado_pupilas);
        return pupilaSeleccionada?.nombre.toLowerCase().includes('anisocóricas');
    });

    // Computada para mostrar campo "Otro" en Tipo de Activación
    const mostrarOtroTipoActivacion = computed(() => {
        if (!catalogos.value.tipos_activacion) return false;
        const tipoSeleccionado = catalogos.value.tipos_activacion.find(
            t => t.id === formulario.value.id_tipo_activacion
        );
        return tipoSeleccionado?.nombre === 'Otro'; // Sensible a mayúsculas
    });

    const toggleFormVisibility = () => {
      showForm.value = !showForm.value;
      if (showForm.value) {
        resetFormulario();
      } else {
        cargarActivaciones();
      }
    };

    const cargarActivaciones = async () => {
      cargando.value = true;
      error.value = null;
      try {
        const response = await api.get('/activaciones?scope=today');
        activaciones.value = response.data;
      } catch (err) {
        console.error("Error al cargar activaciones:", err);
        error.value = 'No se pudieron cargar los registros.';
      } finally {
        cargando.value = false;
      }
    };

    const cargarCatalogos = async () => {
        try {
            const res = await api.get('/catalogos');
            catalogos.value = res.data;
        } catch (err) {
            console.error("Error al cargar catálogos:", err);
            mensaje.value = 'Error fatal: No se pudieron cargar las opciones del formulario.';
            tipoMensaje.value = 'alert-danger';
        }
    };

    onMounted(() => {
      cargarCatalogos();
      cargarActivaciones();
    });

    const registrarActivacion = async () => {
      try {
        const payload = { ...formulario.value };
        if (payload.paciente_edad === '') payload.paciente_edad = null;
        
        // Limpiar el campo "Otro" si no está seleccionado
        if (!mostrarOtroTipoActivacion.value) {
            payload.tipo_activacion_otro = ''; 
        }

        // Validar lógica de traslado antes de enviar
        if (payload.requirio_traslado && (!payload.hospital_destino || payload.hospital_destino.trim() === '')) {
            mensaje.value = 'Error: Si se trasladó, debe especificar el Hospital Destino.';
            tipoMensaje.value = 'alert-danger';
            return;
        }
        if (!payload.requirio_traslado && !payload.id_estado_traslado) {
            mensaje.value = 'Error: Si no se trasladó, debe especificar el Estado del Servicio.';
            tipoMensaje.value = 'alert-danger';
            return;
        }

        const resp = await api.post('/activaciones', payload);
        mensaje.value = `¡Éxito! Registro guardado con folio: ${resp.data.data.num_reporte_local}`;
        tipoMensaje.value = 'alert-success';

        setTimeout(() => {
          mensaje.value = '';
          showForm.value = false;
          cargarActivaciones();
        }, 2500);
      } catch (error) {
         console.error("Error al guardar:", error.response || error);
        mensaje.value = `Error al guardar: ${error.response?.data?.error || 'Verifique los datos e intente de nuevo.'}`;
        tipoMensaje.value = 'alert-danger';
      }
    };

    const resetFormulario = () => {
        formulario.value = initialFormState();
        tieneReporteExterno.value = false;
    };

    const agregarLesion = () => {
      formulario.value.lesiones.push({
        id_tipo_lesion: null,
        id_ubicacion_lesion: null,
        descripcion_lesion: ''
      });
    };

    const eliminarLesion = (index) => {
      formulario.value.lesiones.splice(index, 1);
    };

    // Watch para la lógica de Reporte Externo
    watch(tieneReporteExterno, (esExterno) => {
      if (!esExterno) {
        formulario.value.origen_reporte = 'Local';
        formulario.value.num_reporte_externo = '';
      } else {
        formulario.value.origen_reporte = 'C5';
      }
    });

    // ===== ¡NUEVO WATCH PARA LA LÓGICA DE TRASLADO! =====
    watch(() => formulario.value.requirio_traslado, (seTraslado) => {
      if (seTraslado) {
        // Si SÍ se trasladó, borramos la opción de "no traslado"
        formulario.value.id_estado_traslado = null;
      } else {
        // Si NO se trasladó, borramos el nombre del hospital
        formulario.value.hospital_destino = '';
      }
    });
    // ====================================================

    return {
      formulario, catalogos, mensaje, tipoMensaje, tieneReporteExterno,
      showForm, pageTitle, currentDate, currentTime, isAnisocoria,
      toggleFormVisibility, registrarActivacion, resetFormulario,
      agregarLesion, eliminarLesion,
      activaciones, cargando, error,
      mostrarOtroTipoActivacion
    };
  }
}
</script>

<style scoped>
/* ESTILOS MEJORADOS PARA EL FORMULARIO */

/* Contenedor principal del formulario */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Secciones del formulario */
.card-section {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

/* Encabezado de sección */
.section-header {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.section-header i {
  font-size: 1.5rem;
  margin-right: 0.8rem;
}

.section-header h3 {
  margin: 0;
  font-weight: 600;
  font-size: 1.3rem;
}

/* Contenido de sección */
.section-content {
  padding: 1.5rem;
}

/* Estructura de filas y grupos de formulario */
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

/* Etiquetas y controles de formulario */
.form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #495057;
}

.form-control, .form-select {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Campos de solo lectura */
.readonly-fields .form-control {
  background-color: #f8f9fa;
  opacity: 0.8;
}

/* Grupos de checkboxes */
.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Toggle switches */
.toggle-group {
  margin: 1rem 0;
}

/* Sección de lesiones */
.empty-lesion {
  text-align: center;
  padding: 1.5rem;
  color: #6c757d;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.empty-lesion i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #adb5bd;
}

.lesion-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  background-color: #f8f9fa;
}

.lesion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #dee2e6;
}

.lesion-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #495057;
}

.add-lesion-btn {
  text-align: center;
  margin-top: 1rem;
}

/* Botones de acción */
.form-actions {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

/* Estilos existentes (mantener para compatibilidad) */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 1.5rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin: 0;
}

.main-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 2rem;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  font-weight: 700;
  color: var(--text-dark);
}

.empty-state {
  padding: 4rem;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 12px;
}

:root {
  --primary: #007bff;
  --primary-dark: #0056b3;
  --text-dark: #343a40;
  --border-color: #dee2e6;
}
</style>