<template>
  <header class="dashboard-header">
    <div class="header-content">
      <div class="logo">
        <i class="fas fa-heartbeat"></i>
        <span>CV Tala</span>
      </div>

      <ul class="nav-tabs">
        <router-link to="/" custom v-slot="{ navigate, isActive }">
          <li :class="{ active: isActive }" @click="navigate">REPORTES</li>
        </router-link>
        <router-link to="/consultas" custom v-slot="{ navigate, isActive }">
          <li :class="{ active: isActive }" @click="navigate">CONSULTAS</li>
        </router-link>
      </ul>

      <div class="user-menu">
        <div class="notification-icon">
          <i class="fas fa-bell"></i>
          <span class="notification-badge">3</span>
        </div>
        <div class="user-avatar" @click="handleLogout" title="Cerrar sesión">
          {{ currentUser?.name?.charAt(0) || 'U' }}{{ currentUser?.name?.split(' ')[1]?.charAt(0) || 'S' }}
        </div>
        <button @click="handleLogout" class="btn-logout" title="Cerrar sesión">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'TheHeader',
  computed: {
    ...mapGetters(['currentUser'])
  },
  methods: {
    handleLogout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
/* Los estilos son los mismos que ya tenías, no hay cambios aquí */
.dashboard-header {
  background: white;
  color: #343a40;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}
.logo {
  display: flex;
  align-items: center;
  font-size: 1.8rem;
  font-weight: 700;
}
.logo i {
  margin-right: 0.8rem;
  font-size: 2.2rem;
  color: #007bff;
}
.nav-tabs {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0.4rem;
  background: #e9ecef;
  border-radius: 50px;
  gap: 0.5rem;
}
.nav-tabs li {
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  font-size: 0.95rem;
  color: #6c757d;
}
.nav-tabs li:hover {
  background-color: white;
  color: #007bff;
}
/* Vue Router agregará la clase 'active' automáticamente */
.nav-tabs li.active {
  background-color: white;
  color: #343a40;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.user-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.notification-icon {
  position: relative;
  font-size: 1.4rem;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}
.notification-icon:hover {
  color: #007bff;
  transform: scale(1.1);
}
.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(45deg, #007bff, #28a745);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  cursor: pointer;
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease-in-out;
}
.user-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.btn-logout {
    background: none;
    border: none;
    color: #6c757d;
    font-size: 1.4rem;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    padding: 0.5rem;
    border-radius: 50%;
}
.btn-logout:hover {
    color: #dc3545;
    transform: scale(1.1);
    background-color: #e9ecef;
}
</style>