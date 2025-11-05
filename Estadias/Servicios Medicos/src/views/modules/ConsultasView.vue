<template>
  <div class="consultas-container">
    <!-- Header Mejorado -->
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

    <!-- Panel de Filtros Mejorado -->
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
        <!-- Filtros Rápidos Mejorados -->
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

        <!-- Filtros por Fecha -->
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

        <!-- Información del Periodo Seleccionado -->
        <div v-if="periodoSeleccionado" class="period-info">
          <i class="fas fa-info-circle me-2"></i>
          Mostrando registros del: <strong>{{ periodoSeleccionado }}</strong>
        </div>
      </div>
    </div>

    <!-- Resultados Mejorados -->
    <div class="results-section">
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
        <!-- Estados de Carga y Error -->
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

        <!-- Tabla de Resultados Mejorada -->
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
                    <button class="btn btn-sm btn-outline-primary action-btn">
                      <i class="fas fa-eye me-1"></i>Ver
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Paginación -->
          <div class="table-footer">
            <div class="results-count">
              Mostrando {{ resultados.length }} registro{{ resultados.length !== 1 ? 's' : '' }}
            </div>
          </div>
        </div>

        <!-- Estado Vacío -->
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
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

// 🛠️ FUNCIONES CORREGIDAS PARA MANEJO DE FECHAS

// Función para formatear Fecha a YYYY-MM-DD SIN problemas de zona horaria
const toISODate = (date) => {
  // Crear fecha en hora local sin conversión UTC
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función para formatear fecha para mostrar (sin cambios de zona horaria)
const formatDateForDisplay = (dateString) => {
  if (!dateString) return 'N/A';
  
  // Si ya es una cadena de fecha YYYY-MM-DD, convertirla correctamente
  const date = new Date(dateString);
  
  // Ajustar para zona horaria local
  const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  
  return adjustedDate.toLocaleDateString('es-ES');
};

export default {
  name: 'ConsultasView',
  setup() {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const filtros = ref({
      fecha_inicio: toISODate(inicioMes),
      fecha_fin: toISODate(hoy)
    });
    
    const resultados = ref([]);
    const cargando = ref(true);
    const error = ref(null);
    const filtroActivo = ref('mes');

    // 🛠️ COMPUTED CORREGIDO para mostrar el periodo seleccionado
    const periodoSeleccionado = computed(() => {
      if (!filtros.value.fecha_inicio || !filtros.value.fecha_fin) return '';
      
      const inicio = formatDateForDisplay(filtros.value.fecha_inicio);
      const fin = formatDateForDisplay(filtros.value.fecha_fin);
      
      return `${inicio} al ${fin}`;
    });

    // Función de búsqueda
    const buscarActivaciones = async () => {
      cargando.value = true;
      error.value = null;
      resultados.value = [];
      try {
        console.log('Buscando con filtros:', filtros.value);
        const response = await api.get('/activaciones', {
          params: filtros.value 
        });
        resultados.value = response.data;
        console.log('Registros encontrados:', response.data.length);
      } catch (err) {
        console.error("Error al buscar activaciones:", err);
        error.value = 'No se pudieron cargar los registros. Verifica tu conexión e intenta nuevamente.';
      } finally {
        cargando.value = false;
      }
    };

    // 🛠️ FUNCIÓN COMPLETAMENTE CORREGIDA PARA FILTROS RÁPIDOS
    const setFiltroRapido = (periodo) => {
      const hoy = new Date();
      let inicio = new Date();
      let fin = new Date(hoy);

      filtroActivo.value = periodo;

      switch (periodo) {
        case 'hoy':
          // Hoy mismo - usar la fecha actual sin cambios
          inicio = new Date(hoy);
          fin = new Date(hoy);
          break;
        case 'semana':
          // Últimos 7 días (incluyendo hoy)
          inicio.setDate(hoy.getDate() - 6);
          break;
        case 'mes':
          // Desde el primer día del mes hasta hoy
          inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
          break;
        case 'anio':
          // Desde el primer día del año hasta hoy
          inicio = new Date(hoy.getFullYear(), 0, 1);
          break;
      }

      console.log('Filtro rápido:', periodo, 'Inicio:', inicio, 'Fin:', fin);

      // Usar la función corregida para formatear fechas
      filtros.value.fecha_inicio = toISODate(inicio);
      filtros.value.fecha_fin = toISODate(fin);
      
      console.log('Fechas formateadas:', filtros.value.fecha_inicio, filtros.value.fecha_fin);
      
      // Ejecutar búsqueda
      buscarActivaciones();
    };

    // Función para resetear filtros
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

    // Función para exportar resultados
    const exportarResultados = () => {
      console.log('Exportando resultados:', resultados.value);
      alert('Función de exportación en desarrollo');
    };

    // Cargar resultados al inicializar
    onMounted(() => {
      buscarActivaciones();
    });

    return {
      filtros,
      resultados,
      cargando,
      error,
      filtroActivo,
      periodoSeleccionado,
      buscarActivaciones,
      setFiltroRapido,
      resetFiltros,
      exportarResultados,
      formatDateForDisplay // Exportar para usar en template
    };
  }
}
</script>

<style scoped>
/* (Mantener todos los estilos igual que antes) */
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

.results-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
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
  width: 100px;
}

.action-btn {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
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

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
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
}
</style>