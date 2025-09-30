<template>
  <div class="dashboard-layout">
    <TheHeader />
    <div class="dashboard-body">
      <TheSidebar />
      <main class="dashboard-main">
        <router-view /> 
      </main>
    </div>
  </div>
</template>

<script>
import TheHeader from '@/components/layout/TheHeader.vue';
import TheSidebar from '@/components/layout/TheSidebar.vue';

export default {
  name: 'DashboardView',
  components: {
    TheHeader,
    TheSidebar
  }
};
</script>

<style>
/* Aquí solo dejamos los estilos generales del layout */
:root {
  --primary: #007bff;
  --primary-dark: #0056b3;
  --primary-light: #e6f2ff;
  --secondary: #28a745;
  --accent: #dc3545;
  --text-dark: #343a40;
  --text-gray: #6c757d;
  --bg-light: #f8f9fa;
  --bg-dark: #e9ecef;
  --border-color: #dee2e6;
  --border-radius: 12px;
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  --transition: all 0.3s ease-in-out;
}

body {
  font-family: 'Inter', sans-serif;
  color: var(--text-dark);
  margin: 0;
  background-color: var(--bg-light);
}

.dashboard-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.dashboard-body {
  display: flex;
  flex: 1;
}

.dashboard-main {
  flex: 1;
  padding: 2.5rem;
  overflow-y: auto;
}
</style>