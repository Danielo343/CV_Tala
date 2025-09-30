<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Consultas y Estadísticas</h1>
    </div>

    <div class="main-content">
      <div class="module-placeholder">
        <i class="fas fa-chart-line fa-3x mb-3"></i>
        <h3>Módulo de Consultas</h3>
        <p class="text-muted">
          Aquí podrás filtrar reportes por fecha y ver las gráficas de estadísticas.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConsultasView'
}
</script>

<style scoped>
/* Estos son estilos para el mensaje temporal, puedes copiarlos */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin: 0;
}

.main-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 3rem;
}

.module-placeholder {
  padding: 4rem;
  text-align: center;
  color: #6c757d;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 12px;
}

.module-placeholder i {
  color: var(--primary);
  margin-bottom: 1rem;
}
</style>