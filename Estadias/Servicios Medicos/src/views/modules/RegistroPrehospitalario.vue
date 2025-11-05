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
        <!-- FORMULARIO DE NUEVO REGISTRO -->
        <div class="form-header">
          <h2>Nuevo Registro de Atención Prehospitalaria</h2>
          <p class="text-muted">La hora de captura se guarda automáticamente.</p>
        </div>

        <div v-if="mensaje" :class="['alert', tipoMensaje]">
          {{ mensaje }}
        </div>

        <form @submit.prevent="registrarActivacion" class="form-container-stacked">

          <!-- SECCIÓN 1: Datos de Activación -->
          <div class="card shadow-sm mb-4 form-section">
            <div class="card-header section-header">
              <h3 class="mb-0"><i class="fas fa-file-invoice me-2"></i>Datos de Activación</h3>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Fecha de Activación (Hora del evento)</label>
                  <input type="date" v-model="formulario.fecha_activacion" class="form-control" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Hora de Activación (Hora del evento)</label>
                  <input type="time" v-model="formulario.hora_activacion" class="form-control" required>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tipo de Activación</label>
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

          <!-- SECCIÓN 2: Causa del Servicio -->
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

          <!-- SECCIÓN 3: Datos del Paciente -->
          <div class="card shadow-sm mb-4 form-section">
            <div class="card-header section-header">
              <h3 class="mb-0"><i class="fas fa-user-injured me-2"></i>Datos del Paciente</h3>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nombre completo</label>
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

          <!-- SECCIÓN 4: Evaluación Clínica -->
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

          <!-- SECCIÓN 5: Registro de Lesiones -->
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

          <!-- SECCIÓN 6: Traslado -->
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
                      <label class="form-label">Hospital Destino</label>
                      <input type="text" v-model="formulario.hospital_destino" class="form-control" placeholder="Nombre del hospital" required>
                  </div>
              </div>
              
              <div v-else class="row">
                  <div class="col-md-12 mb-3">
                      <label class="form-label">Estado del Servicio</label>
                      <select v-model="formulario.id_estado_traslado" class="form-select" required>
                          <option :value="null" disabled>Seleccione estado del servicio</option>
                          <option v-for="op in catalogos.estados_traslado" :key="op.id" :value="op.id">{{ op.nombre }}</option>
                      </select>
                  </div>
              </div>
            </div>
          </div>

          <!-- BOTÓN GUARDAR -->
          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-lg">
              <i class="fas fa-save me-2"></i>
              <b>Guardar Registro</b>
            </button>
          </div>
        </form>
      </div>

      <!-- VISTA DE REGISTROS DEL DÍA (NUEVO DISEÑO) -->
      <div v-else class="registros-container">
        <!-- Header de Registros -->
        <div class="registros-header">
          <div class="header-content">
            <div class="title-section">
              <i class="fas fa-clipboard-list header-icon"></i>
              <div>
                <h2>Registros del Día</h2>
                <p class="subtitle">{{ currentDateFormatted }}</p>
              </div>
            </div>
            <div class="header-stats">
              <div class="stat-card">
                <div class="stat-value">{{ activaciones.length }}</div>
                <div class="stat-label">Total Registros</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido Principal -->
        <div class="registros-content">
          <div v-if="cargando" class="loading-state">
            <div class="spinner-container">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-3">Cargando registros del día...</p>
            </div>
          </div>

          <div v-else-if="error" class="error-state">
            <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
            <h4>Error al cargar registros</h4>
            <p class="text-muted">{{ error }}</p>
            <button class="btn btn-primary mt-2" @click="cargarActivaciones">
              <i class="fas fa-redo me-2"></i>Reintentar
            </button>
          </div>

          <div v-else-if="activaciones.length > 0" class="table-section">
            <div class="table-container">
              <div class="table-responsive">
                <table class="registros-table">
                  <thead>
                    <tr>
                      <th class="folio-col">Folio</th>
                      <th class="fecha-col">Fecha y Hora</th>
                      <th class="paciente-col">Paciente</th>
                      <th class="tipo-col">Tipo</th>
                      <th class="causa-col">Causa</th>
                      <th class="acciones-col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="activacion in activaciones" :key="activacion.id" class="registro-row">
                      <td class="folio-cell">
                        <div class="folio-badge">{{ activacion.num_reporte_local }}</div>
                      </td>
                      <td class="fecha-cell">
                        <div class="fecha-text">
                          {{ new Date(activacion.fecha_activacion).toLocaleDateString() }}
                        </div>
                        <div class="hora-text">{{ activacion.hora_activacion }}</div>
                      </td>
                      <td class="paciente-cell">
                        <div class="paciente-nombre">{{ activacion.paciente_nombre }}</div>
                        <div v-if="activacion.paciente_edad" class="paciente-info">
                          {{ activacion.paciente_edad }} años • {{ activacion.paciente_sexo || 'N/D' }}
                        </div>
                      </td>
                      <td class="tipo-cell">
                        <span class="badge tipo-badge">{{ activacion.tipo_activacion || 'N/A' }}</span>
                      </td>
                      <td class="causa-cell">
                        <span class="causa-text">{{ activacion.causa_clinica || 'N/A' }}</span>
                      </td>
                      <td class="acciones-cell">
                        <div class="action-buttons">
                          <button class="btn btn-sm btn-outline-primary action-btn">
                            <i class="fas fa-eye me-1"></i>Ver
                          </button>
                          <button class="btn btn-sm btn-outline-secondary action-btn">
                            <i class="fas fa-edit me-1"></i>Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="table-footer">
                <div class="results-count">
                  Mostrando {{ activaciones.length }} registro{{ activaciones.length !== 1 ? 's' : '' }} del día
                </div>
                <div class="table-actions">
                  <button class="btn btn-outline-secondary btn-sm">
                    <i class="fas fa-download me-1"></i>Exportar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-file-medical fa-3x"></i>
            </div>
            <h4>No hay registros para el día de hoy</h4>
            <p class="text-muted">Haz clic en "Nuevo Registro" para crear el primero del día.</p>
            <button class="btn btn-primary mt-3" @click="toggleFormVisibility">
              <i class="fas fa-plus me-2"></i>Crear Nuevo Registro
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/services/api';

// 🛠️ FUNCIÓN CORREGIDA para manejo de fechas
const toISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const initialFormState = () => ({
  fecha_activacion: toISODate(new Date()), // 🛠️ Usar función corregida
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
  tipo_activacion_otro: '',
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
    // --- Variables ---
    const catalogos = ref({});
    const formulario = ref(initialFormState());
    const mensaje = ref('');
    const tipoMensaje = ref('');
    const tieneReporteExterno = ref(false);
    const showForm = ref(false);
    const activaciones = ref([]);
    const cargando = ref(true);
    const error = ref(null);

    // --- Computadas ---
    const pageTitle = computed(() => (showForm.value ? 'Nuevo Registro Prehospitalario' : 'Registros del Día'));
    const currentDate = computed(() => new Date().toISOString().split('T')[0]);
    const currentTime = computed(() => new Date().toTimeString().split(' ')[0].substring(0, 5));
    
    // Nueva computada para formatear la fecha del header
    const currentDateFormatted = computed(() => {
      return new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });

    const isAnisocoria = computed(() => {
        const pupilaSeleccionada = catalogos.value.estados_pupilas?.find(p => p.id === formulario.value.evaluacion.id_estado_pupilas);
        return pupilaSeleccionada?.nombre.toLowerCase().includes('anisocóricas');
    });

    const mostrarOtroTipoActivacion = computed(() => {
        if (!catalogos.value.tipos_activacion) return false;
        const tipoSeleccionado = catalogos.value.tipos_activacion.find(
            t => t.id === formulario.value.id_tipo_activacion
        );
        return tipoSeleccionado?.nombre === 'Otro';
    });

    // --- Métodos ---
    const toggleFormVisibility = () => {
      showForm.value = !showForm.value;
      if (showForm.value) {
        resetFormulario();
      } else {
        cargarActivaciones();
      }
    };


    // 🛠️ FUNCIÓN CORREGIDA para cargar activaciones
    const cargarActivaciones = async () => {
      cargando.value = true;
      error.value = null;
      try {
        const hoy = toISODate(new Date()); // 🛠️ Usar función corregida
        console.log('Buscando registros para:', hoy);
        
        const response = await api.get('/activaciones', {
          params: {
            fecha_inicio: hoy,
            fecha_fin: hoy
          }
        });
        
        activaciones.value = response.data;
        console.log('Registros encontrados:', response.data.length);
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

    // --- Watchers ---
    watch(tieneReporteExterno, (esExterno) => {
      if (!esExterno) {
        formulario.value.origen_reporte = 'Local';
        formulario.value.num_reporte_externo = '';
      } else {
        formulario.value.origen_reporte = 'C5';
      }
    });

    watch(() => formulario.value.requirio_traslado, (seTraslado) => {
      if (seTraslado) {
        formulario.value.id_estado_traslado = null;
      } else {
        formulario.value.hospital_destino = '';
      }
    });

    // --- Ciclo de vida ---
    onMounted(() => {
      cargarCatalogos();
      cargarActivaciones();
    });

    // --- Return ---
    return {
      formulario, catalogos, mensaje, tipoMensaje, tieneReporteExterno,
      showForm, pageTitle, currentDate, currentTime, isAnisocoria,
      currentDateFormatted, // <-- Nueva variable
      toggleFormVisibility, registrarActivacion, resetFormulario,
      agregarLesion, eliminarLesion,
      activaciones, cargando, error,
      mostrarOtroTipoActivacion
    };
  }
}
</script>

<style scoped>
/* ESTILOS GENERALES */
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
  color: #0056b3;
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
  color: #343a40;
}

/* ESTILOS DEL FORMULARIO (se mantienen igual) */
.form-container-stacked {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.form-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.section-header {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.section-header h3 {
  margin: 0;
  font-weight: 600;
  font-size: 1.3rem;
}

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

.form-actions {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

/* ESTILOS PARA LA NUEVA VISTA DE REGISTROS */
.registros-container {
  max-width: 1400px;
  margin: 0 auto;
}

.registros-header {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  font-size: 2.5rem;
  opacity: 0.9;
}

.registros-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.subtitle {
  opacity: 0.9;
  margin: 0.25rem 0 0 0;
  font-size: 1rem;
}

.header-stats {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.registros-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.loading-state, .error-state, .empty-state {
  padding: 3rem;
  text-align: center;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-state i {
  color: #dc3545;
}

.empty-icon {
  color: #6c757d;
  margin-bottom: 1rem;
}

.table-section {
  padding: 0;
}

.table-container {
  padding: 0;
}

.table-responsive {
  overflow-x: auto;
}

.registros-table {
  width: 100%;
  border-collapse: collapse;
}

.registros-table thead {
  background: #f8f9fa;
}

.registros-table th {
  padding: 1rem;
  font-weight: 600;
  color: #495057;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.registros-table td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.registro-row:hover {
  background: #f8f9fa;
  transition: background-color 0.2s ease;
}

.folio-cell {
  width: 120px;
}

.folio-badge {
  background: #28a745;
  color: white;
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  text-align: center;
  display: inline-block;
}

.fecha-cell {
  width: 140px;
}

.fecha-text {
  font-weight: 500;
  font-size: 0.9rem;
}

.hora-text {
  font-size: 0.8rem;
  color: #6c757d;
}

.paciente-cell {
  width: 220px;
}

.paciente-nombre {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.paciente-info {
  font-size: 0.8rem;
  color: #6c757d;
}

.tipo-cell {
  width: 150px;
}

.tipo-badge {
  background: #6c757d;
  color: white;
  padding: 0.35rem 0.65rem;
  border-radius: 20px;
  font-size: 0.75rem;
}

.causa-cell {
  min-width: 200px;
}

.causa-text {
  font-size: 0.9rem;
  line-height: 1.4;
}

.acciones-cell {
  width: 160px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  white-space: nowrap;
}

.table-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-count {
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .table-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .table-actions {
    justify-content: center;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>