<template>
  <div class="reportes-container">
    
    <div class="page-header-compact">
      <div class="header-content-compact">
        <div class="title-section-compact">
          <i class="fas fa-chart-pie header-icon"></i>
          <div>
            <h1 class="page-title">Reportes y Estadísticas</h1>
            <p class="page-subtitle">Análisis visual de las activaciones del servicio</p>
          </div>
        </div>
         <div class="header-stats-compact">
          <div class="stat-badge">
            <span class="stat-value">{{ currentYear }}</span>
            <span class="stat-label">Año Actual</span>
          </div>
        </div>
      </div>
    </div>

    <div class="filters-panel-compact">
      <div class="panel-header-compact">
        <div class="filters-header">
          <h3><i class="fas fa-filter me-2"></i>Filtros de Reporte</h3>
          <div class="period-info-compact" v-if="filtros.fecha_inicio">
            <i class="fas fa-calendar-alt me-1"></i>
            <span>{{ formatDate(filtros.fecha_inicio) }} al {{ formatDate(filtros.fecha_fin) }}</span>
          </div>
        </div>
      </div>
      
      <div class="panel-body-compact">
        <div class="main-filters-grid">
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
              >
                <i :class="periodo.icono" class="mb-1"></i>
                <span>{{ periodo.nombre }}</span>
              </button>
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">Rango Personalizado</label>
            <div class="date-filters-row">
              <div class="date-field">
                <span class="date-label">Desde</span>
                <input type="date" class="form-control form-control-sm date-input-custom" v-model="filtros.fecha_inicio">
              </div>
              <div class="date-field">
                <span class="date-label">Hasta</span>
                <input type="date" class="form-control form-control-sm date-input-custom" v-model="filtros.fecha_fin">
              </div>
              <button class="btn btn-primary btn-sm search-btn-compact" @click="cargarTodosLosReportes" title="Buscar">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content pt-2">
      <div class="row">
        
        <div class="col-xl-6 col-lg-6 mb-4">
          <div class="chart-card card-shadow h-100" @click="abrirModalGrafica('destinos', 'Destino Posterior')">
            <div class="card-header-compact">
              <h3 class="card-title-compact"><i class="fas fa-hospital me-2 text-primary"></i>Destino Posterior</h3>
              <span v-if="totals.destinos > 0" class="badge-total">{{ totals.destinos }} Total</span>
              <i class="fas fa-expand-alt expand-icon ms-auto"></i>
            </div>
            <div class="card-body p-3">
              <div class="chart-container-small">
                <div v-if="loading.destinos" class="chart-placeholder">
                    <div class="spinner-border text-primary spinner-sm"></div>
                </div>
                <div v-else-if="errors.destinos" class="chart-placeholder error">
                    <i class="fas fa-exclamation-triangle"></i><p>Error al cargar</p>
                </div>
                <Pie v-else-if="chartData.destinos" :data="chartData.destinos" :options="pieOptions" />
                <div v-else class="chart-placeholder empty">
                    <i class="fas fa-folder-open fa-2x mb-2 text-muted"></i>
                    <p class="text-muted small">No hay activaciones en este periodo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-6 col-lg-6 mb-4">
          <div class="chart-card card-shadow h-100" @click="abrirModalGrafica('origen', 'Origen de Activación')">
            <div class="card-header-compact">
              <h3 class="card-title-compact"><i class="fas fa-phone-alt me-2 text-success"></i>Origen de Activación</h3>
              <span v-if="totals.origen > 0" class="badge-total">{{ totals.origen }} Total</span>
              <i class="fas fa-expand-alt expand-icon ms-auto"></i>
            </div>
            <div class="card-body p-3">
              <div class="chart-container-small">
                <div v-if="loading.origen" class="chart-placeholder"><div class="spinner-border text-primary spinner-sm"></div></div>
                <div v-else-if="errors.origen" class="chart-placeholder error"><i class="fas fa-exclamation-triangle"></i><p>Error</p></div>
                <Pie v-else-if="chartData.origen" :data="chartData.origen" :options="pieOptions" />
                
                <div v-else class="chart-placeholder empty">
                    <i class="fas fa-phone-slash fa-2x mb-2 text-muted"></i>
                    <p class="text-muted small">Sin registros de llamadas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-6 col-lg-6 mb-4">
          <div class="chart-card card-shadow h-100" @click="abrirModalGrafica('clinicas', 'Urgencias Médicas')">
            <div class="card-header-compact">
              <h3 class="card-title-compact"><i class="fas fa-stethoscope me-2 text-info"></i>Urgencias Médicas</h3>
              <span v-if="totals.clinicas > 0" class="badge-total">{{ totals.clinicas }} Total</span>
              <i class="fas fa-expand-alt expand-icon ms-auto"></i>
            </div>
            <div class="card-body p-3">
              <div class="chart-container-small">
                <div v-if="loading.clinicas" class="chart-placeholder"><div class="spinner-border text-primary spinner-sm"></div></div>
                <div v-else-if="errors.clinicas" class="chart-placeholder error"><i class="fas fa-exclamation-triangle"></i><p>Error</p></div>
                <Bar v-else-if="chartData.clinicas" :data="chartData.clinicas" :options="barOptions" />
                
                <div v-else class="chart-placeholder empty">
                    <i class="fas fa-notes-medical fa-2x mb-2 text-muted"></i>
                    <p class="text-muted small">Sin urgencias clínicas registradas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-6 col-lg-6 mb-4">
          <div class="chart-card card-shadow h-100" @click="abrirModalGrafica('traumas', 'Emergencias Traumatológicas')">
            <div class="card-header-compact">
              <h3 class="card-title-compact"><i class="fas fa-band-aid me-2 text-warning"></i>Emergencias Traumatológicas</h3>
              <span v-if="totals.traumas > 0" class="badge-total">{{ totals.traumas }} Total</span>
              <i class="fas fa-expand-alt expand-icon ms-auto"></i>
            </div>
            <div class="card-body p-3">
              <div class="chart-container-small">
                <div v-if="loading.traumas" class="chart-placeholder"><div class="spinner-border text-primary spinner-sm"></div></div>
                <div v-else-if="errors.traumas" class="chart-placeholder error"><i class="fas fa-exclamation-triangle"></i><p>Error</p></div>
                <Bar v-else-if="chartData.traumas" :data="chartData.traumas" :options="barOptions" />
                
                <div v-else class="chart-placeholder empty">
                    <i class="fas fa-user-injured fa-2x mb-2 text-muted"></i>
                    <p class="text-muted small">Sin registros de trauma</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="modal fade" id="chartModal" tabindex="-1" aria-hidden="true" ref="chartModalRef">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold text-primary">
              {{ modalTitle }}
              <span v-if="modalTotal > 0" class="badge bg-secondary ms-2 fs-6">{{ modalTotal }} Total</span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="chart-container-large">
              <Pie v-if="modalChartType === 'pie' && modalChartData" :data="modalChartData" :options="largePieOptions" />
              <Bar v-if="modalChartType === 'bar' && modalChartData" :data="modalChartData" :options="largeBarOptions" />
            </div>
          </div>
          <div class="modal-footer bg-light">
             <div class="text-muted me-auto small">
                <i class="fas fa-calendar me-1"></i> Periodo: {{ formatDate(filtros.fecha_inicio) }} - {{ formatDate(filtros.fecha_fin) }}
             </div>
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import { Modal } from 'bootstrap';
import { Bar, Pie } from 'vue-chartjs';
import { 
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

// --- ESTADO DE FILTROS ---
const filtros = ref({ fecha_inicio: '', fecha_fin: '' });
const filtroActivo = ref('todo'); // Por defecto TODO
const periodosRapidos = [
  { id: 'todo', nombre: 'Todo', icono: 'fas fa-infinity' },
  { id: 'semana', nombre: 'Semana', icono: 'fas fa-calendar-week' },
  { id: 'mes', nombre: 'Mes', icono: 'fas fa-calendar-alt' },
  { id: 'anio', nombre: 'Año', icono: 'fas fa-calendar' }
];
const currentYear = computed(() => new Date().getFullYear());

// --- ESTADO DE GRÁFICAS ---
const chartData = ref({ destinos: null, origen: null, clinicas: null, traumas: null });
const loading = ref({ destinos: true, origen: true, clinicas: true, traumas: true });
const errors = ref({ destinos: null, origen: null, clinicas: null, traumas: null });
const totals = ref({ destinos: 0, origen: 0, clinicas: 0, traumas: 0 });

// --- ESTADO DEL MODAL ---
const chartModalRef = ref(null);
let chartModalInstance = null;
const modalTitle = ref('');
const modalChartData = ref(null);
const modalChartType = ref('');
const modalTotal = ref(0);

// --- OPCIONES DE GRÁFICAS ---
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } } }
};

const largeBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } } }
};

// 2. Opciones para PASTEL (Con Tooltip personalizado)
const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      display: true,
      position: 'bottom',
      labels: { boxWidth: 12, font: { size: 10 } }
    },
    // --- NUEVA CONFIGURACIÓN DE TOOLTIP ---
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.formattedValue;
          const dataset = context.dataset;
          const index = context.dataIndex;
          
          // Línea principal: "Otros Hospitales: 5"
          let lines = [`${label}: ${value}`];

          // Si hay desglose (nombres de hospitales), lo añadimos
            if (dataset.desglose && dataset.desglose[index] && dataset.desglose[index] !== label) {
             const nombres = dataset.desglose[index].split(', ');
            // Añadimos una línea por cada hospital (o una línea resumen)
            // Para que se vea limpio: "Incluye: Clínica X, Hospital Y..."
            lines.push(`(${dataset.desglose[index]})`);
          }
          
          return lines;
        }
      }
    }
  }
};

const largePieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      display: true,
      position: 'bottom',
      labels: { boxWidth: 12, font: { size: 10 } }
    },
    // --- NUEVA CONFIGURACIÓN DE TOOLTIP ---
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.formattedValue;
          const dataset = context.dataset;
          const index = context.dataIndex;
          
          // Línea principal: "Otros Hospitales: 5"
          let lines = [`${label}: ${value}`];

          // Si hay desglose (nombres de hospitales), lo añadimos
            if (dataset.desglose && dataset.desglose[index] && dataset.desglose[index] !== label) {
             const nombres = dataset.desglose[index].split(', ');
            // Añadimos una línea por cada hospital (o una línea resumen)
            // Para que se vea limpio: "Incluye: Clínica X, Hospital Y..."
            lines.push(`(${dataset.desglose[index]})`);
          }
          
          return lines;
        }
      }
    }
  }
};

// --- HELPERS ---
const toISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (isoDate) => {
    if(!isoDate) return '...';
    const parts = isoDate.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

const generateRandomColors = (num) => {
  const colors = [];
  for (let i = 0; i < num; i++) {
    const r = Math.floor(Math.random() * 200);
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);
    colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
  }
  return colors;
};

const formatChartData = (apiData, label) => {
  if (!apiData || apiData.length === 0) return null;
  const labels = apiData.map(i => i.nombre || 'N/A');
  const data = apiData.map(i => parseInt(i.total));
  // Capturamos el desglose (lista de nombres) que viene de la API
  const extraData = apiData.map(i => i.desglose); 
  
  const totalSum = data.reduce((a, b) => a + b, 0);

  return {
    chartData: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: generateRandomColors(data.length),
        borderColor: '#fff',
        borderWidth: 1,
        desglose: extraData // <-- Guardamos la info extra aquí
      }]
    },
    total: totalSum
  };
};

// --- CARGA ---
const loadReport = async (key, endpoint, label) => {
  try {
    loading.value[key] = true;
    errors.value[key] = null;
    const res = await api.get(endpoint, { params: filtros.value });
    
    const formatted = formatChartData(res.data, label);
    if (formatted) {
      chartData.value[key] = formatted.chartData;
      totals.value[key] = formatted.total;
    } else {
      chartData.value[key] = null;
      totals.value[key] = 0;
    }
  } catch (err) {
    errors.value[key] = 'Error al cargar';
    console.error(err);
  } finally {
    loading.value[key] = false;
  }
};

const cargarTodosLosReportes = () => {
  loadReport('destinos', '/reportes/destinos', 'Servicios');
  loadReport('origen', '/reportes/origen', 'Llamadas');
  loadReport('clinicas', '/reportes/causas-clinicas', 'Casos');
  loadReport('traumas', '/reportes/causas-traumaticas', 'Lesiones');
};

// --- FILTROS ---
const setFiltroRapido = (periodo) => {
  const hoy = new Date();
  let inicio = new Date();
  let fin = new Date(hoy);
  
  if (filtroActivo.value === periodo && periodo !== 'todo') return;
  
  filtroActivo.value = periodo;

  switch (periodo) {
    case 'todo':
      filtros.value.fecha_inicio = '';
      filtros.value.fecha_fin = '';
      cargarTodosLosReportes();
      return;
    case 'semana': inicio.setDate(hoy.getDate() - 6); break;
    case 'mes': 
      inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      break;
    case 'anio':
      inicio = new Date(hoy.getFullYear(), 0, 1);
      fin = new Date(hoy.getFullYear(), 11, 31);
      break;
  }
  filtros.value.fecha_inicio = toISODate(inicio);
  filtros.value.fecha_fin = toISODate(fin);
  cargarTodosLosReportes();
};

// --- MODAL ---
const abrirModalGrafica = (key, title) => {
  if (!chartData.value[key]) return;
  modalTitle.value = title;
  modalChartData.value = chartData.value[key];
  modalChartType.value = (key === 'destinos' || key === 'origen') ? 'pie' : 'bar';
  modalTotal.value = totals.value[key];
  chartModalInstance.show();
};

onMounted(() => {
  if (chartModalRef.value) chartModalInstance = new Modal(chartModalRef.value);
  setFiltroRapido('todo');
});
</script>

<style scoped>
/* Estilos Base */
.reportes-container { max-width: 1400px; margin: 0 auto; padding: 1rem; }
.page-header-compact { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin-bottom: 1rem; overflow: hidden; }
.header-content-compact { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; }
.title-section-compact { display: flex; align-items: center; gap: 0.75rem; }
.header-icon { font-size: 1.5rem; opacity: 0.9; }
.page-title { font-size: 1.5rem; font-weight: 600; margin: 0; }
.page-subtitle { opacity: 0.9; margin: 0.25rem 0 0 0; font-size: 0.875rem; }
.stat-badge { background: rgba(255, 255, 255, 0.2); padding: 0.5rem 0.75rem; border-radius: 20px; backdrop-filter: blur(10px); display: flex; align-items: center; gap: 0.25rem; }
.stat-value { font-size: 1rem; font-weight: 700; }
.stat-label { font-size: 0.75rem; opacity: 0.9; }

/* Filtros */
.filters-panel-compact { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); margin-bottom: 1rem; overflow: hidden; }
.panel-header-compact { padding: 0.75rem 1.5rem; border-bottom: 1px solid #e9ecef; background: #f8f9fa; }
.filters-header { display: flex; justify-content: space-between; align-items: center; }
.filters-header h3 { margin: 0; font-size: 1rem; font-weight: 600; color: #495057; }
.period-info-compact { background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; padding: 0.25rem 0.75rem; color: #0066cc; font-size: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
.panel-body-compact { padding: 1rem 1.5rem; }
.main-filters-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: end; }
.filter-group { display: flex; flex-direction: column; gap: 0.4rem; }
.filter-label { font-weight: 600; color: #6c757d; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }

.quick-filters-compact { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
.quick-filter-btn-compact { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.1rem; padding: 0.4rem; border: 1px solid #e9ecef; border-radius: 6px; background: white; color: #6c757d; transition: all 0.2s ease; cursor: pointer; font-size: 0.75rem; }
.quick-filter-btn-compact:hover { border-color: #007bff; color: #007bff; }
.quick-filter-btn-compact.active { border-color: #007bff; background: #007bff; color: white; }

.date-filters-row { display: flex; align-items: flex-end; gap: 0.75rem; }
.date-field { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
.date-label { font-size: 0.75rem; color: #6c757d; }
.date-input-custom { font-size: 0.85rem; padding: 0.4rem 0.5rem; }
.search-btn-compact { height: 34px; padding: 0 1rem; display: flex; align-items: center; }

/* Badge de Total */
.badge-total { background-color: #e9ecef; color: #495057; border: 1px solid #ced4da; padding: 0.35em 0.65em; font-size: 0.75em; font-weight: 700; border-radius: 0.25rem; margin-left: 0.5rem; white-space: nowrap; }

/* Gráficas */
.chart-card { background: white; border: 1px solid #e9ecef; border-radius: 8px; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; overflow: hidden; }
.chart-card:hover { transform: translateY(-3px); box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); }
.card-header-compact { padding: 0.75rem 1rem; border-bottom: 1px solid #f0f0f0; background: white; display: flex; align-items: center; }
.card-title-compact { font-size: 0.9rem; font-weight: 600; color: #495057; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; }
.expand-icon { color: #adb5bd; font-size: 0.9rem; transition: color 0.2s; }
.chart-card:hover .expand-icon { color: #007bff; }

.chart-container-small { height: 250px; position: relative; }
.chart-container-large { height: 500px; position: relative; }
.chart-placeholder { height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #adb5bd; }

/* Estilo especial para estado vacío */
.chart-placeholder.empty i { opacity: 0.5; }

@media (max-width: 992px) { .main-filters-grid { grid-template-columns: 1fr; gap: 1rem; } }
</style>