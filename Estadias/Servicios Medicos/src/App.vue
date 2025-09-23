<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link to="/" class="navbar-brand">
          Sistema de Atención Prehospitalaria
        </router-link>
      </div>
    </nav>
    <router-view/>
  </div>
</template>

<script>
// ELIMINA cualquier import de RouterLink o RouterView aquí
// Vue Router los registra automáticamente
export default {
  name: 'App'
}
</script>

<style>
/* Tus estilos */
</style>