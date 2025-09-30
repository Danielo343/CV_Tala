<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Eventos y Simulacros</h1>
    </div>

    <div class="main-content">
      <div class="module-placeholder">
        <i class="fas fa-calendar-alt fa-3x mb-3"></i>
        <h3>Módulo de Eventos</h3>
        <p class="text-muted">
          Aquí se administrará el registro de eventos especiales, simulacros y coberturas.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EventosView'
}
</script>

<style scoped>
/* Copiamos los mismos estilos que usamos en ConsultasView para mantener la coherencia */
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
  color: #0056b3; /* Color de --primary-dark */
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
  color: #007bff; /* Color de --primary */
  margin-bottom: 1rem;
}

.text-muted {
  color: #6c757d;
}

.mb-3 {
  margin-bottom: 1rem !important;
}

.fa-3x {
  font-size: 3em;
}
</style>