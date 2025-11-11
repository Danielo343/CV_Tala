<template>
  <div class="consultas-container">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <i class="fas fa-chart-line header-icon"></i>
          <div>
            <h1 class="page-title">Consultas y Reportes</h1>
            <p class="page-subtitle">Analiza y consulta los registros prehospitalarios</p>
          </div>
        </div>
        <div class="header-stats">
          <div class="stat-card">
            <div class="stat-value">{{ resultados.length }}</div>
            <div class="stat-label">Registros encontrados</div>
          </div>
        </div>
      </div>
    </div>

    <div class="filters-panel">
      <div class="panel-header">
        <h3><i class="fas fa-filter me-2"></i>Filtros de Búsqueda</h3>
        <button 
          class="btn btn-sm btn-outline-secondary" 
          @click="resetFiltros"
          :disabled="cargando"
        >
          <i class="fas fa-undo me-1"></i>Limpiar
        </button>
      </div>
      
      <div class="panel-body">
        <div class="quick-filters-section">
          <label class="section-label">Periodos Predefinidos</label>
          <div class="quick-filters-grid">
            <button 
              type="button" 
              class="quick-filter-btn"
              :class="{ active: filtroActivo === 'hoy' }"
              @click="setFiltroRapido('hoy')"
              :disabled="cargando"
            >
              <i class="fas fa-calendar-day"></i>
              <span>Hoy</span>
            </button>
            <button 
              type="button" 
              class="quick-filter-btn"
              :class="{ active: filtroActivo === 'semana' }"
              @click="setFiltroRapido('semana')"
              :disabled="cargando"
            >
              <i class="fas fa-calendar-week"></i>
              <span>Esta Semana</span>
            </button>
            <button 
              type="button" 
              class="quick-filter-btn"
              :class="{ active: filtroActivo === 'mes' }"
              @click="setFiltroRapido('mes')"
              :disabled="cargando"
            >
              <i class="fas fa-calendar-alt"></i>
              <span>Este Mes</span>
            </button>
            <button 
              type="button" 
              class="quick-filter-btn"
              :class="{ active: filtroActivo === 'anio' }"
              @click="setFiltroRapido('anio')"
              :disabled="cargando"
            >
              <i class="fas fa-calendar"></i>
              <span>Este Año</span>
            </button>
          </div>
        </div>

        <div class="custom-filters-section">
          <label class="section-label">Rango Personalizado</label>
          <form @submit.prevent="buscarActivaciones" class="custom-filters-form">
            <div class="date-inputs-grid">
              <div class="form-group">
                <label for="fecha_inicio" class="form-label">
                  <i class="fas fa-calendar-plus me-1"></i>Fecha Inicio
                </label>
                <input 
                  type="date" 
                  class="form-control" 
                  id="fecha_inicio" 
                  v-model="filtros.fecha_inicio" 
                  required
                  :disabled="cargando"
                >
              </div>
              <div class="form-group">
                <label for="fecha_fin" class="form-label">
                  <i class="fas fa-calendar-minus me-1"></i>Fecha Fin
                </label>
                <input 
                  type="date" 
                  class="form-control" 
                  id="fecha_fin" 
                  v-model="filtros.fecha_fin" 
                  required
                  :disabled="cargando"
                >
              </div>
              <div class="form-group search-btn-container">
                <button 
                  type="submit" 
                  class="btn btn-primary search-btn"
                  :disabled="cargando"
                >
                  <i class="fas fa-search me-2"></i>
                  {{ cargando ? 'Buscando...' : 'Buscar' }}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div v-if="periodoSeleccionado" class="period-info">
          <i class="fas fa-info-circle me-2"></i>
          Mostrando registros del: <strong>{{ periodoSeleccionado }}</strong>
        </div>
      </div>
    </div>

    <!-- Contenedor Principal con Panel Deslizante -->
    <div class="main-layout" :class="{ 'editing-mode': panelActivo }">
      
      <!-- Sección de Resultados -->
      <div class="results-section" :class="{ 'compressed': panelActivo }">
        <div class="results-header">
          <h3>Resultados de la Búsqueda</h3>
          <div class="results-actions">
            <button 
              class="btn btn-outline-secondary btn-sm"
              @click="exportarResultados"
              :disabled="resultados.length === 0 || cargando"
            >
              <i class="fas fa-download me-1"></i>Exportar
            </button>
          </div>
        </div>

        <div class="results-content">
          <div v-if="cargando" class="loading-state">
            <div class="spinner-container">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-3">Buscando registros en el sistema...</p>
            </div>
          </div>

          <div v-else-if="error" class="error-state">
            <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
            <h4>Error en la búsqueda</h4>
            <p class="text-muted">{{ error }}</p>
            <button class="btn btn-primary mt-2" @click="buscarActivaciones">
              <i class="fas fa-redo me-2"></i>Reintentar
            </button>
          </div>

          <div v-else-if="resultados.length > 0" class="table-container">
            <div class="table-responsive">
              <table class="results-table">
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
                  <tr v-for="activacion in resultados" :key="activacion.id" class="result-row">
                    <td class="folio-cell">
                      <div class="folio-badge">{{ activacion.num_reporte_local }}</div>
                    </td>
                    <td class="fecha-cell">
                      <div class="fecha-text">
                        {{ formatDateForDisplay(activacion.fecha_activacion) }}
                      </div>
                      <div class="hora-text">{{ activacion.hora_activacion }}</div>
                    </td>
                    <td class="paciente-cell">
                      <div class="paciente-nombre">{{ activacion.paciente_nombre }}</div>
                      <div v-if="activacion.paciente_edad" class="paciente-info">
                        {{ activacion.paciente_edad }} años
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
                        <button 
                          class="btn btn-sm btn-outline-primary action-btn"
                          @click="verDetalle(activacion)"
                        >
                          <i class="fas fa-eye me-1"></i>Ver
                        </button>
                        
                        <!-- Botón para edición rápida en panel -->
                        <button 
                          v-if="isAdmin" 
                          class="btn btn-sm btn-outline-warning action-btn"
                          @click="abrirPanelEdicion(activacion)"
                          title="Edición rápida"
                        >
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
                Mostrando {{ resultados.length }} registro{{ resultados.length !== 1 ? 's' : '' }}
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-search fa-3x"></i>
            </div>
            <h4>No se encontraron registros</h4>
            <p class="text-muted">Intenta con un rango de fechas diferente o ajusta los filtros de búsqueda.</p>
            <button class="btn btn-outline-primary mt-2" @click="resetFiltros">
              <i class="fas fa-undo me-2"></i>Restablecer filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Panel de Edición Deslizante -->
      <div class="edition-panel" :class="{ 'active': panelActivo }">
        <div class="panel-header">
          <div class="panel-title">
            <i class="fas fa-edit me-2"></i>
            <span>Edición Rápida</span>
            <small class="text-muted ms-2" v-if="datosParaEditar">
              Folio: {{ datosParaEditar.num_reporte_local }}
            </small>
          </div>
          <div class="panel-actions">
            <button 
              class="btn btn-sm btn-outline-info me-2"
              @click="irAEdicionCompleta(datosParaEditar)"
              title="Abrir en página completa"
            >
              <i class="fas fa-expand me-1"></i>Completa
            </button>
            <button class="btn-close-panel" @click="cerrarPanelEdicion">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="panel-content">
          <div v-if="cargandoFormulario" class="loading-panel">
            <div class="spinner-border text-primary"></div>
            <p>Cargando datos del registro...</p>
          </div>

          <div v-else class="form-container">
            <div v-if="mensajeEdicion" :class="['alert', tipoMensajeEdicion, 'mb-3']">
              {{ mensajeEdicion }}
            </div>

            <FormActivacion
              ref="formActivacionRef"
              :catalogs="catalogos"
              :initialData="datosParaEditar"
              :loading="false"
              :saving="isSaving"
              :showHeader="false"
              :showActions="false"
              :titulo="''"
              :subtitulo="''"
              :mensaje="''"
              :tipoMensaje="''"
              @save="guardarRegistro"
              @cancel="cerrarPanelEdicion"
              @save-error="mostrarErrorEdicion"
            />
          </div>
        </div>

        <div class="panel-footer">
          <button class="btn btn-outline-secondary" @click="cerrarPanelEdicion" :disabled="isSaving">
            <i class="fas fa-times me-2"></i>Cancelar
          </button>
          <button class="btn btn-primary" @click="ejecutarGuardado" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fas fa-save me-2"></i>
            {{ isSaving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>

      <!-- Overlay para cerrar panel -->
      <div class="panel-overlay" :class="{ 'active': panelActivo }" @click="cerrarPanelEdicion"></div>
    </div>

    <!-- Modal de Detalle (se mantiene igual) -->
    <div class="modal fade" id="modalDetalleActivacion" ref="modalDetalleRef" tabindex="-1" aria-labelledby="modalDetalleLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalDetalleLabel">
              <i class="fas fa-file-invoice me-2"></i>
              Detalle del Registro
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body modal-body-detallado">
            
            <div v-if="cargandoDetalle" class="loading-state-modal">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-3">Cargando detalles del registro...</p>
            </div>

            <div v-else-if="activacionSeleccionada">
              <div class="detalle-header">
                <h3>Folio: <span class="text-primary">{{ activacionSeleccionada.num_reporte_local }}</span></h3>
                <p class="text-muted">
                  Capturado el: {{ formatDateForDisplay(activacionSeleccionada.fecha_captura) }} a las {{ activacionSeleccionada.hora_captura }}
                </p>
              </div>

              <div class="detalle-seccion card">
                <div class="card-header">
                  <i class="fas fa-user-injured me-2"></i> Datos del Paciente
                </div>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><strong>Nombre:</strong> {{ activacionSeleccionada.paciente_nombre }}</li>
                  <li class="list-group-item"><strong>Edad:</strong> {{ activacionSeleccionada.paciente_edad || 'N/A' }} años</li>
                  <li class="list-group-item"><strong>Sexo:</strong> {{ activacionSeleccionada.paciente_sexo || 'N/A' }}</li>
                </ul>
              </div>

              <div class="detalle-seccion card">
                <div class="card-header">
                  <i class="fas fa-file-invoice me-2"></i> Datos de Activación
                </div>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><strong>Fecha/Hora Evento:</strong> {{ formatDateForDisplay(activacionSeleccionada.fecha_activacion) }} a las {{ activacionSeleccionada.hora_activacion }}</li>
                  <li class="list-group-item"><strong>Tipo Activación:</strong> {{ activacionSeleccionada.tipo_activacion_nombre || 'N/A' }}</li>
                  <li v-if="activacionSeleccionada.tipo_activacion_otro" class="list-group-item"><strong>Otro Tipo:</strong> {{ activacionSeleccionada.tipo_activacion_otro }}</li>
                  <li class="list-group-item"><strong>Unidad Asignada:</strong> {{ activacionSeleccionada.unidad_asignada_nombre || 'N/A' }}</li>
                  <li class="list-group-item"><strong>Origen Reporte:</strong> {{ activacionSeleccionada.origen_reporte }}</li>
                  <li v-if="activacionSeleccionada.num_reporte_externo" class="list-group-item"><strong>Folio Externo:</strong> {{ activacionSeleccionada.num_reporte_externo }}</li>
                </ul>
              </div>

              <div class="detalle-seccion card">
                <div class="card-header">
                  <i class="fas fa-stethoscope me-2"></i> Causa del Servicio
                </div>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><strong>Causa Clínica:</strong> {{ activacionSeleccionada.causa_clinica_nombre || 'N/A' }}</li>
                  <li class="list-group-item"><strong>Agente Causal:</strong> {{ activacionSeleccionada.agente_causante_general_nombre || 'N/A' }}</li>
                  <li v-if="activacionSeleccionada.causa_clinica_especifica" class="list-group-item"><strong>Desc. Clínica:</strong> {{ activacionSeleccionada.causa_clinica_especifica }}</li>
                  <li v-if="activacionSeleccionada.causas_traumaticas_nombres && activacionSeleccionada.causas_traumaticas_nombres.length > 0" class="list-group-item">
                    <strong>Causas Traumáticas:</strong>
                    <ul class="mt-2">
                      <li v-for="causa in activacionSeleccionada.causas_traumaticas_nombres" :key="causa">{{ causa }}</li>
                    </ul>
                  </li>
                  <li v-if="activacionSeleccionada.ct_especifico" class="list-group-item"><strong>Desc. Traumática:</strong> {{ activacionSeleccionada.ct_especifico }}</li>
                </ul>
              </div>

              <div class="detalle-seccion card">
                <div class="card-header">
                  <i class="fas fa-heart-pulse me-2"></i> Evaluación Clínica
                </div>
                <div v-if="activacionSeleccionada.evaluacion">
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item"><strong>Estado Pupilas:</strong> {{ activacionSeleccionada.evaluacion.estado_pupilas_nombre || 'N/A' }}</li>
                    <li v-if="activacionSeleccionada.evaluacion.anisocoria_lado" class="list-group-item"><strong>Lado Anisocoria:</strong> {{ activacionSeleccionada.evaluacion.anisocoria_lado }}</li>
                    <li class="list-group-item"><strong>Estado Piel:</strong> {{ activacionSeleccionada.evaluacion.estado_piel_nombre || 'N/A' }}</li>
                  </ul>
                </div>
                <div v-else class="list-group-item text-muted">
                  No se registró evaluación clínica.
                </div>
              </div>

              <div class="detalle-seccion card">
                <div class="card-header">
                  <i class="fas fa-band-aid me-2"></i> Lesiones Registradas
                </div>
                <div v-if="activacionSeleccionada.lesiones && activacionSeleccionada.lesiones.length > 0">
                  <ul class="list-group list-group-flush">
                    <li v-for="(lesion, index) in activacionSeleccionada.lesiones" :key="index" class="list-group-item">
                      <strong>{{ lesion.tipo_lesion_nombre || 'Lesión' }}</strong> en <strong>{{ lesion.ubicacion_lesion_nombre || 'N/D' }}</strong>
                      <p v-if="lesion.descripcion_lesion" class="text-muted mb-0">{{ lesion.descripcion_lesion }}</p>
                    </li>
                  </ul>
                </div>
                <div v-else class="list-group-item text-muted">
                  No se registraron lesiones.
                </div>
              </div>

              <div class="detalle-seccion card">
                <div class="card-header">
                  <i class="fas fa-ambulance me-2"></i> Traslado
                </div>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item">
                    <strong>¿Se trasladó?:</strong> 
                    <span :class="activacionSeleccionada.requirio_traslado ? 'text-success' : 'text-danger'">
                      {{ activacionSeleccionada.requirio_traslado ? 'Sí' : 'No' }}
                    </span>
                  </li>
                  <li v-if="activacionSeleccionada.requirio_traslado" class="list-group-item"><strong>Hospital Destino:</strong> {{ activacionSeleccionada.hospital_destino }}</li>
                  <li v-else class="list-group-item"><strong>Estado del Servicio:</strong> {{ activacionSeleccionada.estado_traslado_nombre || 'N/A' }}</li>
                </ul>
              </div>

            </div>
            
            <div v-else-if="errorDetalle" class="error-state-modal">
              <i class="fas fa-exclamation-triangle fa-2x mb-3 text-danger"></i>
              <h4>Error al cargar el detalle</h4>
              <p class="text-muted">{{ errorDetalle }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-2"></i>Cerrar
            </button>
            <button type="button" class="btn btn-primary">
              <i class="fas fa-print me-2"></i>Imprimir Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex'; 
import { useRouter } from 'vue-router';
import api from '@/services/api';
import { Modal } from 'bootstrap'; 
import FormActivacion from '@/components/FormActivacion.vue'; 

// --- Funciones Helper ---
const toISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
// --- Fin Funciones Helper ---

export default {
  name: 'ConsultasView',
  components: {
    FormActivacion
  },
  setup() {
    // --- Estado de la Vista ---
    const store = useStore();
    const router = useRouter();
    const isAdmin = computed(() => store.getters.isAdmin);
    
    const filtros = ref({
      fecha_inicio: toISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
      fecha_fin: toISODate(new Date())
    });
    
    const resultados = ref([]);
    const cargando = ref(true);
    const error = ref(null);
    const filtroActivo = ref('mes');

    const catalogos = ref({});

    // --- Estado para el Modal de "Ver Detalle" ---
    const modalDetalleRef = ref(null); 
    let modalDetalle = null; 
    const activacionSeleccionada = ref(null); 
    const cargandoDetalle = ref(false); 
    const errorDetalle = ref(null); 

    // --- Estado para el Panel de Edición ---
    const panelActivo = ref(false);
    const formActivacionRef = ref(null);
    const cargandoFormulario = ref(false); 
    const isSaving = ref(false); 
    const datosParaEditar = ref(null); 
    const mensajeEdicion = ref(''); 
    const tipoMensajeEdicion = ref('');

    // --- Computadas ---
    const periodoSeleccionado = computed(() => {
      if (!filtros.value.fecha_inicio || !filtros.value.fecha_fin) return '';
      const inicio = formatDateForDisplay(filtros.value.fecha_inicio);
      const fin = formatDateForDisplay(filtros.value.fecha_fin);
      return `${inicio} al ${fin}`;
    });

    // --- Métodos de la Vista ---
    const cargarCatalogos = async () => {
        try {
            const res = await api.get('/catalogos');
            catalogos.value = res.data;
        } catch (err) {
            console.error("Error al cargar catálogos:", err);
            error.value = 'Error fatal: No se pudieron cargar las opciones del formulario.';
        }
    };

    const buscarActivaciones = async () => {
      cargando.value = true;
      error.value = null;
      resultados.value = [];
      try {
        const response = await api.get('/activaciones', {
          params: filtros.value 
        });
        resultados.value = response.data;
      } catch (err) {
        console.error("Error al buscar activaciones:", err);
        error.value = 'No se pudieron cargar los registros. Verifica tu conexión e intenta nuevamente.';
      } finally {
        cargando.value = false;
      }
    };

    const setFiltroRapido = (periodo) => {
      const hoy = new Date();
      let inicio = new Date();
      let fin = new Date(hoy);
      filtroActivo.value = periodo;
      switch (periodo) {
        case 'hoy':
          inicio = new Date(hoy);
          fin = new Date(hoy);
          break;
        case 'semana':
          inicio.setDate(hoy.getDate() - 6);
          break;
        case 'mes':
          inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
          break;
        case 'anio':
          inicio = new Date(hoy.getFullYear(), 0, 1);
          break;
      }
      filtros.value.fecha_inicio = toISODate(inicio);
      filtros.value.fecha_fin = toISODate(fin);
      buscarActivaciones();
    };

    const resetFiltros = () => {
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      filtros.value = {
        fecha_inicio: toISODate(inicioMes),
        fecha_fin: toISODate(hoy)
      };
      filtroActivo.value = 'mes';
      buscarActivaciones();
    };

    const exportarResultados = () => {
      console.log('Exportando resultados:', resultados.value);
      alert('Función de exportación en desarrollo');
    };

    // --- Métodos del Modal de "Ver Detalle" ---
    const verDetalle = async (activacion) => {
      if (!modalDetalle) return;
      cargandoDetalle.value = true;
      errorDetalle.value = null;
      activacionSeleccionada.value = null; 
      modalDetalle.show();
      try {
        const response = await api.get(`/activaciones/${activacion.id}`);
        activacionSeleccionada.value = response.data;
      } catch (err) {
        console.error("Error al cargar detalle:", err);
        errorDetalle.value = 'No se pudo cargar la información del registro.';
      } finally {
        cargandoDetalle.value = false;
      }
    };

    // --- Métodos para el Panel de Edición ---
    const abrirPanelEdicion = async (activacion) => {
      panelActivo.value = true;
      datosParaEditar.value = null;
      cargandoFormulario.value = true;
      mensajeEdicion.value = '';

      try {
        const response = await api.get(`/activaciones/${activacion.id}`);
        datosParaEditar.value = response.data;
      } catch (err) {
        console.error("Error al cargar datos para editar:", err);
        mensajeEdicion.value = 'Error al cargar los datos del registro.';
        tipoMensajeEdicion.value = 'alert-danger';
      } finally {
        cargandoFormulario.value = false;
      }
    };

    const cerrarPanelEdicion = () => {
      if (!isSaving.value) {
        panelActivo.value = false;
        datosParaEditar.value = null;
        mensajeEdicion.value = '';
      }
    };

    const ejecutarGuardado = () => {
      if (formActivacionRef.value) {
        formActivacionRef.value.submitForm();
      }
    };

    const mostrarErrorEdicion = (msg) => {
      mensajeEdicion.value = msg;
      tipoMensajeEdicion.value = 'alert-danger';
    };

    const guardarRegistro = async (payload) => {
      isSaving.value = true;
      mensajeEdicion.value = '';
      tipoMensajeEdicion.value = '';

      try {
        const resp = await api.put(`/api/activaciones/${payload.id}`, payload);
        mensajeEdicion.value = `¡Éxito! Registro ${resp.data.data.num_reporte_local} actualizado.`;
        tipoMensajeEdicion.value = 'alert-success';

        setTimeout(() => {
          cerrarPanelEdicion();
          buscarActivaciones(); 
        }, 2000);

      } catch (error) {
         console.error("Error al actualizar:", error.response || error);
        mensajeEdicion.value = `Error al guardar: ${error.response?.data?.error || 'Verifique los datos.'}`;
        tipoMensajeEdicion.value = 'alert-danger';
      } finally {
        isSaving.value = false;
      }
    };

    // --- Método para edición en página completa ---
    const irAEdicionCompleta = (activacion) => {
      if (activacion && activacion.id) {
        // Guardar estado actual para regresar
        const estadoBusqueda = {
          filtros: { ...filtros.value },
          resultadosCount: resultados.value.length
        };
        
        localStorage.setItem('consultaReturnState', JSON.stringify(estadoBusqueda));
        router.push(`/editar-registro/${activacion.id}?returnTo=consultas`);
      }
    };

    // --- Ciclo de vida ---
    onMounted(() => {
      if (modalDetalleRef.value) {
        modalDetalle = new Modal(modalDetalleRef.value);
      }
      
      cargarCatalogos();
      buscarActivaciones();

      // Restaurar estado si venimos de edición
      const savedState = localStorage.getItem('consultaReturnState');
      if (savedState) {
        const state = JSON.parse(savedState);
        filtros.value = state.filtros;
        localStorage.removeItem('consultaReturnState');
      }
    });

    // --- Return ---
    return {
      filtros,
      resultados,
      cargando,
      error,
      filtroActivo,
      periodoSeleccionado,
      isAdmin,
      catalogos,
      buscarActivaciones,
      setFiltroRapido,
      resetFiltros,
      exportarResultados,
      formatDateForDisplay,
      modalDetalleRef,
      cargandoDetalle,
      errorDetalle,
      activacionSeleccionada,
      verDetalle,
      // Panel de edición
      panelActivo,
      formActivacionRef,
      cargandoFormulario,
      isSaving,
      datosParaEditar,
      mensajeEdicion,
      tipoMensajeEdicion,
      abrirPanelEdicion,
      cerrarPanelEdicion,
      ejecutarGuardado,
      guardarRegistro,
      mostrarErrorEdicion,
      irAEdicionCompleta
    };
  }
}
</script>

<style scoped>
.consultas-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.page-subtitle {
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

.filters-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #495057;
}

.panel-body {
  padding: 1.5rem;
}

.section-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 1rem;
  display: block;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quick-filters-section {
  margin-bottom: 2rem;
}

.quick-filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.quick-filter-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  color: #6c757d;
  transition: all 0.3s ease;
  cursor: pointer;
}

.quick-filter-btn:hover {
  border-color: #007bff;
  color: #007bff;
  transform: translateY(-2px);
}

.quick-filter-btn.active {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.quick-filter-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.quick-filter-btn i {
  font-size: 1.25rem;
}

.custom-filters-section {
  margin-bottom: 1.5rem;
}

.custom-filters-form {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.date-inputs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
}

.form-group {
  margin-bottom: 0;
}

.search-btn-container {
  display: flex;
  align-items: end;
}

.search-btn {
  height: fit-content;
  white-space: nowrap;
}

.period-info {
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  color: #0066cc;
  font-size: 0.9rem;
}

/* Layout Principal con Panel */
.main-layout {
  position: relative;
  transition: all 0.3s ease;
}

.results-section {
  transition: all 0.3s ease;
}

.results-section.compressed {
  width: calc(100% - 600px);
  opacity: 0.7;
  pointer-events: none;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.results-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #495057;
}

.results-content {
  padding: 0;
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

.table-container {
  padding: 0;
}

.table-responsive {
  overflow-x: auto;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table thead {
  background: #f8f9fa;
}

.results-table th {
  padding: 1rem;
  font-weight: 600;
  color: #495057;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.results-table td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.result-row:hover {
  background: #f8f9fa;
}

.folio-cell {
  width: 120px;
}

.folio-badge {
  background: #007bff;
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
  width: 200px;
}

.paciente-nombre {
  font-weight: 500;
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
}

.acciones-cell {
  width: 220px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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
}

/* Panel de Edición Deslizante */
.edition-panel {
  position: fixed;
  top: 0;
  right: -650px;
  width: 650px;
  height: 100vh;
  background: white;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
  z-index: 1050;
  display: flex;
  flex-direction: column;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.edition-panel.active {
  right: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border-bottom: 1px solid #dee2e6;
}

.panel-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-close-panel {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.btn-close-panel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.loading-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6c757d;
}

.form-container {
  padding: 1.5rem;
  height: 100%;
}

.panel-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Overlay */
.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1049;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.panel-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* Estilos del Modal de Detalle */
.modal-header {
  background: var(--bg-light, #f8f9fa);
  border-bottom: 1px solid var(--border-color, #dee2e6);
}

.modal-title {
  color: var(--primary-dark, #0056b3);
  font-weight: 600;
}

.modal-body-detallado {
  background-color: #f8f9fa;
  padding: 1.5rem;
}

.loading-state-modal, .error-state-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--text-gray, #6c757d);
}

.detalle-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--primary, #007bff);
}

.detalle-header h3 {
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.detalle-seccion {
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 8px;
  overflow: hidden;
}

.detalle-seccion .card-header {
  font-weight: 600;
  font-size: 1.1rem;
  background-color: #f0f3f5;
  color: var(--text-dark, #343a40);
  border-bottom: 1px solid var(--border-color, #dee2e6);
  padding: 0.75rem 1.25rem;
}

.detalle-seccion .list-group-item {
  padding: 0.75rem 1.25rem;
  background-color: #ffffff;
}

.detalle-seccion .list-group-item strong {
  color: var(--text-dark, #343a40);
  margin-right: 0.5rem;
}

.detalle-seccion .list-group-item p {
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.modal-footer {
  background: var(--bg-light, #f8f9fa);
  border-top: 1px solid var(--border-color, #dee2e6);
}

/* Responsive */
@media (max-width: 1200px) {
  .edition-panel {
    width: 550px;
    right: -550px;
  }
  
  .results-section.compressed {
    width: calc(100% - 550px);
  }
}

@media (max-width: 992px) {
  .edition-panel {
    width: 500px;
    right: -500px;
  }
  
  .results-section.compressed {
    width: calc(100% - 500px);
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .date-inputs-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .results-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .results-actions {
    display: flex;
    justify-content: center;
  }
  
  .edition-panel {
    width: 100%;
    right: -100%;
  }
  
  .results-section.compressed {
    width: 100%;
    opacity: 0.3;
    pointer-events: none;
  }
  
  .panel-header {
    padding: 1rem;
  }
  
  .form-container {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .consultas-container {
    padding: 0.5rem;
  }
  
  .panel-body, .results-content {
    padding: 1rem;
  }
  
  .quick-filters-grid {
    grid-template-columns: 1fr;
  }
  
  .panel-footer {
    flex-direction: column;
  }
}
</style>