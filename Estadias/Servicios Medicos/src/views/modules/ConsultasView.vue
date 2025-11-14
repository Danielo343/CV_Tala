<template>
  <div class="consultas-container">
    <!-- Header más compacto -->
    <div class="page-header-compact">
      <div class="header-content-compact">
        <div class="title-section-compact">
          <i class="fas fa-chart-line header-icon"></i>
          <div>
            <h1 class="page-title">Consultas y Reportes</h1>
            <p class="page-subtitle">Analiza y consulta los registros prehospitalarios</p>
          </div>
        </div>
        <div class="header-stats-compact">
          <div class="stat-badge">
            <span class="stat-value">{{ resultados.length }}</span>
            <span class="stat-label">registros</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de Filtros Mejorado -->
    <div class="filters-panel-compact">
      <div class="panel-header-compact">
        <div class="filters-header">
          <h3><i class="fas fa-filter me-2"></i>Filtros de Búsqueda</h3>
          <div class="header-actions">
            <button 
              class="btn btn-sm btn-outline-secondary" 
              @click="resetFiltros"
              :disabled="cargando"
            >
              <i class="fas fa-undo me-1"></i>Limpiar
            </button>
            <button 
              class="btn btn-sm btn-outline-info" 
              @click="toggleFiltrosAvanzados"
            >
              <i class="fas fa-sliders-h me-1"></i>
              {{ mostrarFiltrosAvanzados ? 'Simple' : 'Avanzado' }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="panel-body-compact">
        <!-- Búsqueda Rápida en Tiempo Real -->
        <div class="search-real-time">
          <div class="search-input-container">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              class="search-input" 
              placeholder="Buscar por nombre, folio, causa..."
              v-model="busquedaTexto"
              @input="buscarEnTiempoReal"
              :disabled="cargando"
            >
            <div v-if="busquedaTexto" class="search-clear" @click="limpiarBusqueda">
              <i class="fas fa-times"></i>
            </div>
          </div>
        </div>

        <!-- Filtros Principales -->
        <div class="main-filters-grid">
          <!-- Filtros Rápidos -->
          <div class="filter-group">
            <label class="filter-label">Periodo</label>
            <div class="quick-filters-compact">
              <button 
                v-for="periodo in periodosRapidos" 
                :key="periodo.id"
                type="button" 
                class="quick-filter-btn-compact"
                :class="{ active: filtroActivo === periodo.id }"
                @click="setFiltroRapido(periodo.id)"
                :disabled="cargando"
              >
                <i :class="periodo.icono"></i>
                <span>{{ periodo.nombre }}</span>
              </button>
            </div>
          </div>

          <!-- Filtros por Fecha -->
          <div class="filter-group">
            <label class="filter-label">Rango de Fechas</label>
            <div class="date-filters-compact">
              <div class="date-input-compact">
                <label>Desde</label>
                <input 
                  type="date" 
                  class="form-control form-control-sm" 
                  v-model="filtros.fecha_inicio" 
                  :disabled="cargando"
                >
              </div>
              <div class="date-input-compact">
                <label>Hasta</label>
                <input 
                  type="date" 
                  class="form-control form-control-sm" 
                  v-model="filtros.fecha_fin" 
                  :disabled="cargando"
                >
              </div>
              <button 
                class="btn btn-primary btn-sm search-btn-compact"
                @click="buscarActivaciones"
                :disabled="cargando"
              >
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Filtros Avanzados (Colapsable) -->
        <div v-if="mostrarFiltrosAvanzados" class="advanced-filters">
          <div class="advanced-filters-grid">
            <div class="filter-group">
              <label class="filter-label">Tipo de Activación</label>
              <select 
                class="form-control form-control-sm" 
                v-model="filtrosAvanzados.tipo_activacion"
                @change="aplicarFiltrosAvanzados"
              >
                <option value="">Todos los tipos</option>
                <option v-for="tipo in catalogos.tipos_activacion" :key="tipo.id" :value="tipo.id">
                  {{ tipo.nombre }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Tipo de Lesión</label>
              <select 
                class="form-control form-control-sm" 
                v-model="filtrosAvanzados.id_tipo_lesion"
                @change="buscarActivaciones" 
              >
                <option value="">Todas las lesiones</option>
                <option v-for="lesion in catalogos.tipos_lesion" :key="lesion.id" :value="lesion.id">
                  {{ lesion.nombre }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Causa Clínica</label>
              <select 
                class="form-control form-control-sm" 
                v-model="filtrosAvanzados.causa_clinica"
                @change="aplicarFiltrosAvanzados"
              >
                <option value="">Todas las causas</option>
                <option v-for="causa in catalogos.causa_clinica" :key="causa.id" :value="causa.id">
                  {{ causa.nombre }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Unidad Asignada</label>
              <select 
                class="form-control form-control-sm" 
                v-model="filtrosAvanzados.unidad_asignada"
                @change="aplicarFiltrosAvanzados"
              >
                <option value="">Todas las unidades</option>
                <option v-for="unidad in catalogos.unidades" :key="unidad.id" :value="unidad.id">
                  {{ unidad.nombre }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Rango de Edad</label>
              <div class="age-range-filters">
                <input 
                  type="number" 
                  class="form-control form-control-sm" 
                  placeholder="Mín" 
                  v-model="filtrosAvanzados.edad_min"
                  @change="aplicarFiltrosAvanzados"
                >
                <span class="age-separator">-</span>
                <input 
                  type="number" 
                  class="form-control form-control-sm" 
                  placeholder="Máx" 
                  v-model="filtrosAvanzados.edad_max"
                  @change="aplicarFiltrosAvanzados"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Info del Periodo -->
        <div v-if="periodoSeleccionado" class="period-info-compact">
          <i class="fas fa-calendar me-1"></i>
          <span>{{ periodoSeleccionado }}</span>
          <span v-if="busquedaTexto" class="search-info">
            • Búsqueda: "{{ busquedaTexto }}"
          </span>
          <span v-if="filtrosAvanzadosActivos" class="filters-info">
            • Filtros activos
          </span>
        </div>
      </div>
    </div>

    <!-- Contenedor Principal con Panel Deslizante -->
    <div class="main-layout" :class="{ 'editing-mode': panelActivo }">
      
      <!-- Sección de Resultados Mejorada -->
      <div class="results-section-improved" :class="{ 'compressed': panelActivo }">
        <div class="results-header-improved">
          <h3>Resultados de la Búsqueda</h3>
          <div class="results-actions-improved">
            <button 
              class="btn btn-outline-secondary btn-sm"
              @click="exportarResultados"
              :disabled="resultados.length === 0 || cargando"
            >
              <i class="fas fa-download me-1"></i>Exportar
            </button>
          </div>
        </div>

        <div class="results-content-improved">
          <!-- Estados de carga, error, vacío -->
          <div v-if="cargando" class="loading-state-compact">
            <div class="spinner-border spinner-border-sm text-primary me-2"></div>
            <span>Buscando registros...</span>
          </div>

          <div v-else-if="error" class="error-state-compact">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <span>{{ error }}</span>
            <button class="btn btn-link btn-sm" @click="buscarActivaciones">Reintentar</button>
          </div>

          <div v-else-if="resultadosFiltrados.length === 0" class="empty-state-compact">
            <i class="fas fa-search me-2"></i>
            <span>No se encontraron registros con los filtros actuales</span>
            <button class="btn btn-link btn-sm" @click="resetFiltros">Limpiar filtros</button>
          </div>

          <!-- Tabla Mejorada -->
          <div v-else class="table-container-improved">
            <div class="table-responsive">
              <table class="results-table-improved">
                <thead>
                  <tr>
                    <th class="folio-col">Folio</th>
                    <th class="fecha-col">Fecha/Hora</th>
                    <th class="paciente-col">Paciente</th>
                    <th class="edad-col">Edad</th>
                    <th class="tipo-col">Tipo</th>
                    <th class="unidad-col">Unidad</th>
                    <th class="causa-col">Causa</th>
                    <th class="hospital-col">Hospital</th>
                    <th class="acciones-col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="activacion in resultadosFiltrados" 
                    :key="activacion.id" 
                    class="result-row-improved"
                    @dblclick="verDetalle(activacion)"
                  >
                    <td class="folio-cell-improved">
                      <div class="folio-badge-improved">{{ activacion.num_reporte_local }}</div>
                    </td>
                    <td class="fecha-cell-improved">
                      <div class="fecha-text">{{ formatDateForDisplay(activacion.fecha_activacion) }}</div>
                      <div class="hora-text">{{ activacion.hora_activacion }}</div>
                    </td>
                    <td class="paciente-cell-improved">
                      <div class="paciente-nombre">{{ activacion.paciente_nombre }}</div>
                    </td>
                    <td class="edad-cell-improved">
                      <span v-if="activacion.paciente_edad" class="edad-badge">
                        {{ activacion.paciente_edad }} años
                      </span>
                      <span v-else class="text-muted">N/A</span>
                    </td>
                    <td class="tipo-cell-improved">
                      <span class="badge tipo-badge-improved">
                        {{ activacion.tipo_activacion || 'N/A' }}
                      </span>
                    </td>
                    <td class="unidad-cell-improved">
                      <span class="unidad-text">{{ activacion.unidad_asignada_nombre || 'N/A' }}</span>
                    </td>
                    <td class="causa-cell-improved">
                      <span class="causa-text">{{ activacion.causa_clinica || 'N/A' }}</span>
                    </td>
                    <td class="hospital-cell-improved">
                      <span class="hospital-text">{{ activacion.hospital_destino || 'N/A' }}</span>
                    </td>
                    <td class="acciones-cell-improved">
                      <div class="action-buttons-improved">
                        <button 
                          class="btn btn-sm btn-outline-primary action-btn-compact"
                          @click="verDetalle(activacion)"
                          title="Ver detalles"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        
                        <button 
                          v-if="isAdmin" 
                          class="btn btn-sm btn-outline-warning action-btn-compact"
                          @click="abrirPanelEdicion(activacion)"
                          title="Edición rápida"
                        >
                          <i class="fas fa-edit"></i>
                        </button>

                        <!-- Botón de Eliminar Mejorado -->
                        <button 
                          v-if="isAdmin" 
                          class="btn btn-sm btn-outline-danger action-btn-compact"
                          @click="solicitarEliminacion(activacion)"
                          title="Eliminar registro"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="table-footer-improved">
              <div class="results-count-improved">
                Mostrando {{ resultadosFiltrados.length }} de {{ resultados.length }} registro{{ resultados.length !== 1 ? 's' : '' }}
              </div>
              <div class="table-actions-improved">
                <button 
                  class="btn btn-sm btn-outline-secondary"
                  @click="scrollToTop"
                  v-if="resultadosFiltrados.length > 10"
                >
                  <i class="fas fa-arrow-up me-1"></i>Volver arriba
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de Edición Deslizante (COMPLETO - SIN CAMBIOS) -->
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
              @delete="eliminarRegistro" 
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

    <!-- Modal de Confirmación de Eliminación -->
    <div class="modal fade" id="modalConfirmarEliminacion" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              <i class="fas fa-exclamation-triangle me-2"></i>
              Confirmar Eliminación
            </h5>
          </div>
          <div class="modal-body">
            <p>¿Está seguro de eliminar permanentemente este registro?</p>
            <div v-if="registroAEliminar" class="alert alert-warning">
              <strong>Folio:</strong> {{ registroAEliminar.num_reporte_local }}<br>
              <strong>Paciente:</strong> {{ registroAEliminar.paciente_nombre }}<br>
              <strong>Fecha:</strong> {{ formatDateForDisplay(registroAEliminar.fecha_activacion) }}
            </div>
            <p class="text-danger"><small>Esta acción no se puede deshacer.</small></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-1"></i>Cancelar
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="confirmarEliminacion"
              :disabled="eliminando"
            >
              <span v-if="eliminando" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-trash me-1"></i>
              {{ eliminando ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalle (COMPLETO - SIN CAMBIOS) -->
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

const normalizeText = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD") // Descompone caracteres (ej: "ó" -> "o" + "´")
    .replace(/[\u0300-\u036f]/g, ""); // Elimina los acentos
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
    
    // Estados principales existentes
    const filtros = ref({
      fecha_inicio: '',
      fecha_fin: ''
    });
    
    const resultados = ref([]);
    const cargando = ref(true);
    const error = ref(null);
    const filtroActivo = ref(null);

    // Nuevos estados para mejoras
    const busquedaTexto = ref('');
    const mostrarFiltrosAvanzados = ref(false);
    const filtrosAvanzados = ref({
      tipo_activacion: '',
      causa_clinica: '',
      unidad_asignada: '',
      id_tipo_lesion: '', // <-- AÑADIR ESTA LÍNEA
      edad_min: '',
      edad_max: ''
    });
    
    const catalogos = ref({});
    const registroAEliminar = ref(null);
    const eliminando = ref(false);

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

    // Nuevas computadas para mejoras
    const filtrosAvanzadosActivos = computed(() => {
      return Object.values(filtrosAvanzados.value).some(val => val !== '');
    });

    const resultadosFiltrados = computed(() => {
      if (!busquedaTexto.value && !filtrosAvanzadosActivos.value) {
        return resultados.value;
      }

      return resultados.value.filter(activacion => {
        // Filtro de búsqueda de texto
          let coincideTexto = true;
            if (busquedaTexto.value) {
              const texto = normalizeText(busquedaTexto.value); // <-- USA LA FUNCIÓN

              coincideTexto = 
                (normalizeText(activacion.paciente_nombre).includes(texto)) ||
                (normalizeText(activacion.num_reporte_local).includes(texto)) ||
                (normalizeText(activacion.causa_clinica).includes(texto)) ||
                (normalizeText(activacion.tipo_activacion).includes(texto)) ||
                (normalizeText(activacion.hospital_destino).includes(texto));
            }

        // Filtros avanzados
        let coincideAvanzado = true;
        if (filtrosAvanzadosActivos.value) {
          if (filtrosAvanzados.value.tipo_activacion && activacion.id_tipo_activacion) {
            coincideAvanzado = coincideAvanzado && activacion.id_tipo_activacion == filtrosAvanzados.value.tipo_activacion;
          }
          if (filtrosAvanzados.value.causa_clinica && activacion.id_causa_clinica) {
            coincideAvanzado = coincideAvanzado && activacion.id_causa_clinica == filtrosAvanzados.value.causa_clinica;
          }
          if (filtrosAvanzados.value.unidad_asignada && activacion.id_unidad_asignada) {
            coincideAvanzado = coincideAvanzado && activacion.id_unidad_asignada == filtrosAvanzados.value.unidad_asignada;
          }
          if (filtrosAvanzados.value.edad_min && activacion.paciente_edad) {
            coincideAvanzado = coincideAvanzado && activacion.paciente_edad >= parseInt(filtrosAvanzados.value.edad_min);
          }
          if (filtrosAvanzados.value.edad_max && activacion.paciente_edad) {
            coincideAvanzado = coincideAvanzado && activacion.paciente_edad <= parseInt(filtrosAvanzados.value.edad_max);
          }
        }

        return coincideTexto && coincideAvanzado;
      });
    });

    // Datos para filtros rápidos
    const periodosRapidos = ref([
      { id: 'hoy', nombre: 'Hoy', icono: 'fas fa-calendar-day' },
      { id: 'semana', nombre: 'Semana', icono: 'fas fa-calendar-week' },
      { id: 'mes', nombre: 'Mes', icono: 'fas fa-calendar-alt' },
      { id: 'anio', nombre: 'Año', icono: 'fas fa-calendar' }
    ]);

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

          // 1. Combinar TODOS los filtros
          const params = {
            ...filtros.value, // fecha_inicio, fecha_fin
            ...filtrosAvanzados.value, // tipo_activacion, causa_clinica, etc.
            busqueda_texto: busquedaTexto.value // El texto de búsqueda
          };

          // 2. Limpiar valores vacíos para no enviar basura a la API
          Object.keys(params).forEach(key => {
            if (params[key] === null || params[key] === '') {
              delete params[key];
            }
          });

          try {
            // 3. Enviar la solicitud GET con todos los parámetros
            console.log('Enviando filtros a la API:', params); // Para depuración
            const response = await api.get('/activaciones', { params });
            resultados.value = response.data;
          } catch (err) {
            console.error("Error al buscar activaciones:", err);
            error.value = 'No se pudieron cargar los registros.';
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
        fecha_inicio: '',
        fecha_fin: ''
      };
      filtroActivo.value = null;
      busquedaTexto.value = '';
      filtrosAvanzados.value = {
        tipo_activacion: '',
        causa_clinica: '',
        unidad_asignada: '',
        edad_min: '',
        edad_max: ''
      };
      buscarActivaciones();
    };

    const exportarResultados = () => {
      console.log('Exportando resultados:', resultados.value);
      alert('Función de exportación en desarrollo');
    };

    // --- Nuevos Métodos para Mejoras ---
    const buscarEnTiempoReal = () => {
      // No necesita hacer nada adicional porque resultadosFiltrados es computada
    };

    const limpiarBusqueda = () => {
      busquedaTexto.value = '';
    };

    const toggleFiltrosAvanzados = () => {
      mostrarFiltrosAvanzados.value = !mostrarFiltrosAvanzados.value;
    };

    const aplicarFiltrosAvanzados = () => {
      // No necesita hacer nada adicional porque resultadosFiltrados es computada
    };

    const solicitarEliminacion = (activacion) => {
      registroAEliminar.value = activacion;
      const modal = new Modal(document.getElementById('modalConfirmarEliminacion'));
      modal.show();
    };

    const confirmarEliminacion = async () => {
      if (!registroAEliminar.value) return;
      
      eliminando.value = true;
      try {
        await api.delete(`/activaciones/${registroAEliminar.value.id}`);
        
        // Cerrar modal
        const modal = Modal.getInstance(document.getElementById('modalConfirmarEliminacion'));
        modal.hide();
        
        // Recargar resultados
        await buscarActivaciones();
        
        // Mostrar mensaje de éxito
        console.log('Registro eliminado exitosamente');
        
      } catch (err) {
        console.error('Error al eliminar:', err);
        error.value = 'Error al eliminar el registro';
      } finally {
        eliminando.value = false;
        registroAEliminar.value = null;
      }
    };

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    console.log("Enviando actualización:", payload);
    
    const resp = await api.put(`/activaciones/${payload.id}`, payload);
    
    mensajeEdicion.value = `¡Éxito! Registro ${resp.data.data.num_reporte_local} actualizado.`;
    tipoMensajeEdicion.value = 'alert-success';

    setTimeout(() => {
      cerrarPanelEdicion();
      buscarActivaciones();
    }, 2000);

  } catch (error) {
    console.error("Error completo al actualizar:", error);
    console.error("Respuesta del servidor:", error.response?.data);
    mensajeEdicion.value = `Error al guardar: ${error.response?.data?.error || error.response?.data?.message || 'Verifique los datos.'}`;
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

    const eliminarRegistro = async (id) => {
  if (!confirm('¿Está seguro de eliminar permanentemente este registro? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    await api.delete(`/activaciones/${id}`);
    mensajeEdicion.value = 'Registro eliminado correctamente';
    tipoMensajeEdicion.value = 'alert-success';
    
    setTimeout(() => {
      cerrarPanelEdicion();
      buscarActivaciones(); // Recargar la lista
    }, 1500);
  } catch (error) {
    console.error('Error al eliminar:', error);
    mensajeEdicion.value = 'Error al eliminar el registro';
    tipoMensajeEdicion.value = 'alert-danger';
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

    // --- Return COMPLETO ---
    return {
      // Estados principales
      filtros,
      resultados,
      cargando,
      error,
      filtroActivo,
      periodoSeleccionado,
      isAdmin,
      catalogos,
      
      // Nuevos estados para mejoras
      busquedaTexto,
      mostrarFiltrosAvanzados,
      filtrosAvanzados,
      resultadosFiltrados,
      periodosRapidos,
      registroAEliminar,
      eliminando,
      filtrosAvanzadosActivos,

      // Estados del modal de detalle
      modalDetalleRef,
      cargandoDetalle,
      errorDetalle,
      activacionSeleccionada,

      // Estados del panel de edición
      panelActivo,
      formActivacionRef,
      cargandoFormulario,
      isSaving,
      datosParaEditar,
      mensajeEdicion,
      tipoMensajeEdicion,

      // Métodos principales
      buscarActivaciones,
      setFiltroRapido,
      resetFiltros,
      exportarResultados,
      formatDateForDisplay,

      // Nuevos métodos para mejoras
      buscarEnTiempoReal,
      limpiarBusqueda,
      toggleFiltrosAvanzados,
      aplicarFiltrosAvanzados,
      solicitarEliminacion,
      confirmarEliminacion,
      scrollToTop,

      // Métodos del modal de detalle
      verDetalle,

      // Métodos del panel de edición
      abrirPanelEdicion,
      cerrarPanelEdicion,
      ejecutarGuardado,
      guardarRegistro,
      mostrarErrorEdicion,
      irAEdicionCompleta,
      eliminarRegistro
    };
  }
}
</script>

<style scoped>
/* Estilos compactos y mejorados */
.consultas-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

/* Header Compacto */
.page-header-compact {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.header-content-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
}

.title-section-compact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  font-size: 1.5rem;
  opacity: 0.9;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.page-subtitle {
  opacity: 0.9;
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
}

.header-stats-compact {
  display: flex;
  gap: 0.5rem;
}

.stat-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.9;
}

/* Panel de Filtros Compacto */
.filters-panel-compact {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
  overflow: hidden;
}

.panel-header-compact {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.panel-body-compact {
  padding: 1.5rem;
}

/* Búsqueda en Tiempo Real */
.search-real-time {
  margin-bottom: 1.5rem;
}

.search-input-container {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input {
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #6c757d;
  padding: 4px;
}

.search-clear:hover {
  color: #495057;
}

/* Filtros Principales */
.main-filters-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quick-filters-compact {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.quick-filter-btn-compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: white;
  color: #6c757d;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 0.75rem;
}

.quick-filter-btn-compact:hover {
  border-color: #007bff;
  color: #007bff;
}

.quick-filter-btn-compact.active {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.quick-filter-btn-compact i {
  font-size: 1rem;
}

.date-filters-compact {
  display: flex;
  gap: 0.5rem;
  align-items: end;
}

.date-input-compact {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-input-compact label {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 500;
}

.search-btn-compact {
  height: fit-content;
  padding: 0.375rem 0.75rem;
}

/* Filtros Avanzados */
.advanced-filters {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.advanced-filters-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.age-range-filters {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.age-separator {
  color: #6c757d;
  font-weight: 600;
}

/* Info del Periodo */
.period-info-compact {
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  color: #0066cc;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-info, .filters-info {
  font-weight: 600;
}

/* Estados Compactos */
.loading-state-compact,
.error-state-compact,
.empty-state-compact {
  padding: 1.5rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #6c757d;
}

.error-state-compact {
  color: #dc3545;
}

/* Tabla Mejorada */
.results-section-improved {
  transition: all 0.3s ease;
}

.results-section-improved.compressed {
  width: calc(100% - 600px);
  opacity: 0.7;
  pointer-events: none;
}

.results-header-improved {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.results-header-improved h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
}

.table-container-improved {
  padding: 0;
}

.results-table-improved {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.results-table-improved thead {
  background: #f8f9fa;
  position: sticky;
  top: 0;
}

.results-table-improved th {
  padding: 0.75rem;
  font-weight: 600;
  color: #495057;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.75rem;
}

.results-table-improved td {
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.result-row-improved:hover {
  background: #f8f9fa;
  cursor: pointer;
}

/* Celdas Específicas */
.folio-cell-improved {
  width: 100px;
}

.folio-badge-improved {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.7rem;
  text-align: center;
  display: inline-block;
}

.fecha-cell-improved {
  width: 100px;
}

.fecha-text {
  font-weight: 500;
  font-size: 0.75rem;
}

.hora-text {
  font-size: 0.7rem;
  color: #6c757d;
}

.paciente-cell-improved {
  width: 150px;
}

.paciente-nombre {
  font-weight: 500;
  font-size: 0.8rem;
}

.edad-cell-improved {
  width: 70px;
}

.edad-badge {
  background: #6c757d;
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 10px;
  font-size: 0.7rem;
  white-space: nowrap;
}

.tipo-cell-improved {
  width: 120px;
}

.tipo-badge-improved {
  background: #6c757d;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
}

.unidad-cell-improved {
  width: 120px;
}

.unidad-text {
  font-size: 0.8rem;
}

.causa-cell-improved {
  width: 150px;
}

.causa-text {
  font-size: 0.8rem;
}

.hospital-cell-improved {
  width: 120px;
}

.hospital-text {
  font-size: 0.8rem;
}

.acciones-cell-improved {
  width: 140px;
}

.action-buttons-improved {
  display: flex;
  gap: 0.25rem;
}

.action-btn-compact {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
}

/* Footer de Tabla */
.table-footer-improved {
  padding: 0.75rem 1rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-count-improved {
  color: #6c757d;
  font-size: 0.75rem;
}

.table-actions-improved {
  display: flex;
  gap: 0.5rem;
}

/* Panel de Edición (ESTILOS ORIGINALES COMPLETOS) */
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

/* Estilos del Modal de Detalle (ORIGINALES COMPLETOS) */
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
  
  .results-section-improved.compressed {
    width: calc(100% - 550px);
  }
  
  .main-filters-grid {
    grid-template-columns: 1fr;
  }
  
  .advanced-filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .edition-panel {
    width: 500px;
    right: -500px;
  }
  
  .results-section-improved.compressed {  
    width: calc(100% - 500px);
  }
}

@media (max-width: 768px) {
  .header-content-compact {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .quick-filters-compact {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .date-filters-compact {
    flex-direction: column;
  }
  
  .advanced-filters-grid {
    grid-template-columns: 1fr;
  }
  
  .results-header-improved {
    flex-direction: column;
    gap: 1rem;
  }
  
  .table-footer-improved {
    flex-direction: column;
    gap: 1rem;
  }
  
  .action-buttons-improved {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-btn-compact {
    width: 100%;
  }
  
  .edition-panel {
    width: 100%;
    right: -100%;
  }
  
  .results-section-improved.compressed {
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
  
  .panel-body-compact {
    padding: 1rem;
  }
  
  .quick-filters-compact {
    grid-template-columns: 1fr;
  }
  
  .panel-footer {
    flex-direction: column;
  }
}
</style>  