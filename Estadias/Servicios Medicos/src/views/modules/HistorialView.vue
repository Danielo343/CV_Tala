<template>
  <div class="historial-container">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <i class="fas fa-history header-icon"></i>
          <div>
            <h1 class="page-title">Historial de Actividad</h1>
            <p class="page-subtitle">Bitácora de cambios y acciones en el sistema</p>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div v-if="cargando" class="loading-state">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3">Cargando historial...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle fa-2x mb-3 text-danger"></i>
        <h4>Error al cargar el historial</h4>
        <p class="text-muted">{{ error }}</p>
      </div>
      
      <div v-else-if="historial.length === 0" class="empty-state">
        <i class="fas fa-file-alt fa-3x mb-3"></i>
        <h4>No hay actividad registrada</h4>
        <p class="text-muted">Aún no se han realizado acciones que queden registradas.</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Fecha y Hora</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Entidad</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in historial" :key="item.id">
              <td>
                <div class="fw-bold">{{ formatTimestamp(item.timestamp) }}</div>
              </td>
              <td>
                <span class="text-muted">{{ item.nombre_usuario || 'Sistema' }}</span>
              </td>
              <td>
                <span :class="['badge', getAccionBadge(item.accion)]">
                  <i :class="['fas', getAccionIcon(item.accion), 'me-1']"></i>
                  {{ item.accion }}
                </span>
              </td>
              <td>
                <span :class="['badge', getEntidadBadge(item.tipo_entidad)]">
                  {{ item.tipo_entidad }}
                </span>
              </td>
              <td>
                {{ item.detalles }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const historial = ref([]);
const cargando = ref(true);
const error = ref(null);

// Cargar historial al montar el componente
onMounted(() => {
  cargarHistorial();
});

async function cargarHistorial() {
  cargando.value = true;
  error.value = null;
  try {
    const response = await api.get('/historial');
    historial.value = response.data;
  } catch (err) {
    console.error(err);
    error.value = 'No se pudo cargar el historial. ' + (err.response?.data?.message || '');
  } finally {
    cargando.value = false;
  }
}

// --- Funciones Helper para dar estilo ---

function formatTimestamp(ts) {
  if (!ts) return 'N/A';
  const date = new Date(ts);
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function getAccionBadge(accion) {
  switch (accion) {
    case 'CREAR': return 'bg-success';
    case 'EDITAR': return 'bg-warning text-dark';
    case 'ELIMINAR': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

function getAccionIcon(accion) {
  switch (accion) {
    case 'CREAR': return 'fa-plus';
    case 'EDITAR': return 'fa-pencil-alt';
    case 'ELIMINAR': return 'fa-trash';
    default: return 'fa-info-circle';
  }
}

function getEntidadBadge(entidad) {
  switch (entidad) {
    case 'ACTIVACION': return 'bg-primary';
    case 'EVENTO': return 'bg-info text-dark';
    case 'USUARIO': return 'bg-dark';
    default: return 'bg-light text-dark';
  }
}

</script>

<style scoped>
.historial-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: white;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
  color: #6c757d;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #343a40;
}

.page-subtitle {
  opacity: 0.9;
  margin: 0.25rem 0 0 0;
  font-size: 1rem;
  color: #6c757d;
}

.main-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 2rem;
}

.loading-state, .error-state, .empty-state {
  padding: 3rem;
  text-align: center;
  color: #6c757d;
}

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}

.badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.4em 0.7em;
}
</style>