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
        
        <div class="user-avatar-container">
          <div class="user-avatar" @click="toggleDropdown" title="Opciones de usuario">
            {{ userInitials }}
          </div>

          <transition name="dropdown-fade">
            <div v-if="isDropdownOpen" class="user-dropdown">
              <div class="dropdown-header">
                <strong>{{ currentUser?.name || 'Usuario' }}</strong>
                <span :class="['badge', isAdmin ? 'bg-primary' : 'bg-secondary']">
                  {{ currentUser?.rol || 'Rol' }}
                </span>
              </div>
              <ul class="dropdown-menu-list">
                
                <li v-if="isAdmin" @click="goTo('GestionUsuarios')">
                  <i class="fas fa-users-cog"></i>
                  <span>Gestionar Usuarios</span>
                </li>

                <li @click="handleLogout">
                  <i class="fas fa-sign-out-alt"></i>
                  <span>Cerrar Sesión</span>
                </li>
              </ul>
            </div>
          </transition>
        </div>
      </div>
      </div>
  </header>
  
  <div v-if="isDropdownOpen" @click="isDropdownOpen = false" class="dropdown-overlay"></div>
</template>

<script>
// --- USANDO OPTIONS API (COMO TU ARCHIVO ORIGINAL) ---
import { mapGetters } from 'vuex';

export default {
  name: 'TheHeader',
  
  // Línea de prueba que confirma que el SCRIPT se carga
  created() {
    console.log("¡VERSIÓN CORRECTA DE TheHeader.vue CARGADA!");
  },

  data() {
    return {
      isDropdownOpen: false
    };
  },

  computed: {
    ...mapGetters(['currentUser', 'isAdmin']), 

    userInitials() {
      const name = this.currentUser?.name;
      if (!name) return 'US';
      
      const parts = name.split(' ');
      const first = parts[0]?.charAt(0) || '';
      const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) || '') : '';
      return (first + last).toUpperCase();
    }
  },
  
  methods: {
    handleLogout() {
      console.log("Clic en Cerrar Sesión"); // Log de prueba
      this.isDropdownOpen = false; 
      this.$store.dispatch('logout');
      this.$router.push('/login');
    },

    toggleDropdown() {
      console.log("Clic en Avatar (toggleDropdown)"); // Log de prueba
      this.isDropdownOpen = !this.isDropdownOpen;
    },

    goTo(routeName) {
      console.log("Clic en goTo:", routeName); // Log de prueba
      this.$router.push({ name: routeName });
      this.isDropdownOpen = false; 
    }
  }
};
</script>

<style scoped>
.dashboard-header {
  background: white;
  color: #343a40;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  /* --- CAMBIO 1 --- */
  z-index: 1001; /* Lo ponemos por ENCIMA del overlay */
  position: relative; /* Necesario para que z-index funcione correctamente */
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

.user-avatar-container {
  position: relative;
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
  user-select: none;
}
.user-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-logout {
  display: none;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 15px);
  right: 0;
  width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e9ecef;
  /* z-index: 1001; */ /* Este z-index ahora es relativo al header (1001) */
  overflow: hidden;
}

.dropdown-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.rol-badge {
  color: white;
  text-transform: capitalize;
}
.rol-badge.bg-primary {
  background-color: #007bff !important;
}
.rol-badge.bg-secondary {
  background-color: #6c757d !important;
}


.dropdown-menu-list {
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
}

.dropdown-menu-list li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-weight: 500;
  color: #343a40;
}

.dropdown-menu-list li:hover {
  background-color: #e6f2ff;
}

.dropdown-menu-list li i {
  width: 20px;
  text-align: center;
  color: #6c757d;
}

.dropdown-menu-list li:last-child {
  color: #dc3545;
}
.dropdown-menu-list li:last-child i {
  color: #dc3545;
}
.dropdown-menu-list li:last-child:hover {
  background-color: #f8d7da;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* --- CAMBIO 2 --- */
  z-index: 1000; /* Lo dejamos por DEBAJO del header */
  background: transparent;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>