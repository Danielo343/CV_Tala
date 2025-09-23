<template>
  <div class="dashboard-layout">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="logo">
          <i class="fas fa-heartbeat"></i>
          <span>CV Tala</span>
        </div>

        <ul class="nav-tabs">
          <li :class="{ active: activeNav === 'reportes' }" @click="activeNav = 'reportes'">REPORTES</li>
          <li :class="{ active: activeNav === 'consultas' }" @click="activeNav = 'consultas'">CONSULTAS</li>
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

    <div class="dashboard-body">
      <aside class="dashboard-sidebar">
        <div class="sidebar-section">
          <div class="sidebar-title">Módulos Principales</div>
          <button :class="['sidebar-button', { active: activeModule === 'prehospitalario' }]" @click="setActiveModule('prehospitalario')">
            <i class="fas fa-ambulance"></i>
            <span class="button-text">PREHOSPITALARIO</span>
          </button>
          <button :class="['sidebar-button', { active: activeModule === 'evento' }]" @click="setActiveModule('evento')">
            <i class="fas fa-calendar-alt"></i>
            <span class="button-text">EVENTO</span>
          </button>
          <button :class="['sidebar-button', { active: activeModule === 'urgencias' }]" @click="setActiveModule('urgencias')">
            <i class="fas fa-procedures"></i>
            <span class="button-text">URGENCIAS</span>
          </button>
        </div>
      </aside>

      <main class="dashboard-main">
        <div class="page-header">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <div class="page-actions" v-if="activeNav === 'reportes' && activeModule === 'prehospitalario' && !showForm">
            <button @click="showForm = true">
              <i class="fas fa-plus"></i>
              <b>Nuevo Registro</b>
            </button>
          </div>
          <div class="page-actions" v-if="activeNav === 'reportes' && activeModule === 'prehospitalario' && showForm">
            <button @click="showForm = false">
              <i class="fas fa-arrow-left"></i>
              <b>Volver</b>
            </button>
          </div>
        </div>

        <div class="section-menu" v-if="activeNav === 'reportes' && activeModule === 'prehospitalario'">
          <div class="section-buttons">
            <button :class="['section-button', { active: activeView === 'formulario' }]" @click="activeView = 'formulario'">
              <i class="fas fa-file-alt"></i>
              Formulario
            </button>
            <button :class="['section-button', { active: activeView === 'eventos' }]" @click="activeView = 'eventos'">
              <i class="fas fa-calendar-check"></i>
              Eventos
            </button>
          </div>
        </div>

        <div v-if="activeNav === 'reportes'" class="main-content">
          <div v-if="activeModule === 'prehospitalario'">
            <div v-if="activeView === 'formulario'">
              <div v-if="showForm">
                <div class="form-container card-shadow">
                  <div class="form-header">
                    <h2>Nuevo Registro de Atención Prehospitalaria</h2>
                    <p class="text-muted">Complete los campos para registrar una nueva atención.</p>
                  </div>
                </div>
                  <div v-if="mensaje" :class="['alert', tipoMensaje]">
                    {{ mensaje }}
                  </div>
                  
                  <form @submit.prevent="enviarRegistro" class="form-grid">
                    <div class="form-section card-light">
                      <h3 class="section-title"><i class="fas fa-route icon-title"></i>Activación y Traslado</h3>
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label">Tipo de Activación *</label>
                          <select v-model="formData.activacion" class="form-select" required>
                            <option value="">Seleccione una opción</option>
                            <option v-for="opcion in opcionesActivacion" :key="opcion" :value="opcion">{{ opcion }}</option>
                          </select>
                        </div>
                        <div class="col-md-6 mb-3">
                          <label class="form-label">Destino *</label>
                          <select v-model="formData.traslado.tipo" class="form-select" required>
                            <option value="">Seleccione destino</option>
                            <option v-for="opcion in opcionesTraslado" :key="opcion" :value="opcion">{{ opcion }}</option>
                          </select>
                        </div>
                      </div>
                      <div class="row" v-if="formData.traslado.tipo === 'Hospital'">
                        <div class="col-md-12 mb-3 mt-2">
                            <label class="form-label">Nombre del Hospital</label>
                            <input type="text" v-model="formData.traslado.nombre_hospital" class="form-control" placeholder="Ej: Hospital General de Zona No. 8">
                        </div>
                      </div>
                    </div>

                    <div class="form-section card-light">
                      <h3 class="section-title"><i class="fas fa-pills icon-title"></i>Causas</h3>
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label">Causa Clínica</label>
                          <select v-model="formData.causa_clinica" class="form-select">
                            <option value="">Seleccione causa clínica</option>
                            <option v-for="opcion in opcionesCausaClinica" :key="opcion" :value="opcion">{{ opcion }}</option>
                          </select>
                        </div>
                        <div class="col-md-6 mb-3">
                          <label class="form-label">Agente Causal</label>
                          <select v-model="formData.causa_traumatica.agente_causal" class="form-select">
                            <option value="">Seleccione agente</option>
                            <option v-for="opcion in opcionesAgenteCausal" :key="opcion" :value="opcion">{{ opcion }}</option>
                          </select>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12 mb-3">
                          <label class="form-label">Especificación</label>
                          <input type="text" v-model="formData.causa_traumatica.especificacion" class="form-control" placeholder="Describa el detalle de la causa">
                        </div>
                      </div>
                    </div>

                    <div class="form-section card-light">
                      <h3 class="section-title"><i class="fas fa-hand-holding-medical icon-title"></i>Lesiones</h3>
                      <div class="checkbox-group">
                        <div v-for="opcion in opcionesLesiones" :key="opcion" class="form-check">
                          <input class="form-check-input" type="checkbox" :value="opcion" v-model="formData.lesiones" :id="'lesion-' + opcion">
                          <label class="form-check-label" :for="'lesion-' + opcion">{{ opcion }}</label>
                        </div>
                      </div>
                    </div>

                    <div class="form-section card-light">
                      <h3 class="section-title"><i class="fas fa-user-injured icon-title"></i>Datos del Paciente</h3>
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label">Nombre completo *</label>
                          <input type="text" v-model="formData.paciente.nombre" class="form-control" placeholder="Ej: Juan Pérez" required>
                        </div>
                        <div class="col-md-6 mb-3">
                          <label class="form-label">Edad</label>
                          <input type="number" v-model="formData.paciente.edad" class="form-control" placeholder="Ej: 35" min="0" max="120">
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label">Sexo</label>
                          <select v-model="formData.paciente.sexo" class="form-select">
                            <option value="">Seleccione</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                            <option value="O">Otro</option>
                          </select>
                        </div>
                        <div class="col-md-6 mb-3">
                          <label class="form-label">Teléfono</label>
                          <input type="tel" v-model="formData.paciente.telefono" class="form-control" placeholder="Ej: 33 1234 5678">
                        </div>
                      </div>
                    </div>

                    <div class="text-center mt-4">
                      <button type="submit" class="btn btn-primary btn-lg">
                        <i class="fas fa-save me-2"></i><b>Guardar Registro</b>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              
<div v-else>
    <div v-if="cargando" class="text-center">
        <p>Cargando registros...</p>
    </div>

    <div v-if="error" class="alert alert-danger">
        {{ error }}
    </div>

    <table v-if="!cargando && activaciones.length > 0" class="table table-striped table-hover card-shadow">
        <thead>
            <tr>
                <th>Folio Local</th>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Tipo de Activación</th>
                <th>Causa Clínica</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="activacion in activaciones" :key="activacion.id">
                <td>{{ activacion.num_reporte_local }}</td>
                <td>{{ new Date(activacion.fecha_activacion).toLocaleDateString() }}</td>
                <td>{{ activacion.paciente_nombre }}</td>
                <td>{{ activacion.tipo_activacion }}</td>
                <td>{{ activacion.causa_clinica || 'N/A' }}</td>
                <td>
                    <button class="btn btn-sm btn-info">Ver Detalles</button>
                </td>
            </tr>
        </tbody>
    </table>

    <div v-if="!cargando && activaciones.length === 0" class="empty-state">
        <i class="fas fa-file-medical-alt"></i>
        <p>No hay registros guardados todavía.</p>
        <p class="text-muted">Haga clic en el botón "Nuevo Registro" para crear el primero.</p>
    </div>
            </div>

            <div v-if="activeView === 'eventos'">
              <div class="content-header">
                <h2 class="content-title">Registro de Eventos</h2>
              </div>
              <div class="event-cards">
                <div class="event-card">
                  <div class="event-card-header">
                    <span>15 Sep 2023</span>
                    <span class="event-type urgente">Urgente</span>
                  </div>
                  <div class="event-card-body">
                    <h3 class="event-title">Accidente de tráfico</h3>
                    <p class="event-details">Colisión múltiple en Av. Principal. 3 heridos, 2 leves y 1 grave.</p>
                    <div class="event-meta">
                      <span><i class="fas fa-map-marker-alt"></i> Av. Principal km 5</span>
                      <span><i class="fas fa-user-md"></i> Dr. García</span>
                    </div>
                  </div>
                </div>
                
                <div class="event-card">
                  <div class="event-card-header">
                    <span>14 Sep 2023</span>
                    <span class="event-type programado">Programado</span>
                  </div>
                  <div class="event-card-body">
                    <h3 class="event-title">Simulacro de evacuación</h3>
                    <p class="event-details">Ejercicio de preparación para emergencias en el área metropolitana.</p>
                    <div class="event-meta">
                      <span><i class="fas fa-map-marker-alt"></i> Centro de la ciudad</span>
                      <span><i class="fas fa-user-md"></i> Coord. Martínez</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="text-center mt-4">
                <button class="btn btn-primary">
                  <i class="fas fa-plus me-2"></i><b>Nuevo Evento</b>
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="activeModule === 'evento'" class="module-placeholder">
            <i class="fas fa-calendar-alt fa-3x mb-3"></i>
            <h3>Módulo de Eventos</h3>
            <p class="text-muted">Aquí se administrará el contenido de los eventos programados.</p>
          </div>
          
          <div v-if="activeModule === 'urgencias'" class="module-placeholder">
            <i class="fas fa-procedures fa-3x mb-3"></i>
            <h3>Módulo de Urgencias</h3>
            <p class="text-muted">Esta sección contendrá información detallada sobre las urgencias.</p>
          </div>
        </div>

        <div v-if="activeNav === 'consultas'" class="main-content">
          <div class="content-header">
            <h2 class="content-title">Consultas y Reportes Estadísticos</h2>
            <p class="text-muted">Visualice los datos de atención a través de gráficos y reportes.</p>
          </div>
          
          <div class="chart-grid">
            <div class="chart-container card-shadow">
              <h4 class="text-center">Atenciones por Tipo</h4>
              <div class="chart-placeholder">
                <i class="fas fa-chart-bar"></i>
                <p>Gráfica de atenciones por tipo</p>
              </div>
            </div>
            <div class="chart-container card-shadow">
              <h4 class="text-center">Pacientes por Género</h4>
              <div class="chart-placeholder">
                <i class="fas fa-chart-pie"></i>
                <p>Gráfica de pacientes por género</p>
              </div>
            </div>
          </div>
          
          <div class="chart-container card-shadow">
            <h4 class="text-center">Atenciones Mensuales</h4>
            <div class="chart-placeholder">
              <i class="fas fa-chart-line"></i>
              <p>Gráfica de atenciones mensuales</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import { mapGetters } from 'vuex';

export default {
  name: 'DashboardView',
  data() {
    return {
      activeNav: 'reportes',
      activeModule: 'prehospitalario',
      activeView: 'formulario',
      showForm: false,
      mensaje: '',
      tipoMensaje: '',
      activaciones: [], // Un arreglo vacío para guardar los registros
      cargando: true,   // Para mostrar un mensaje de "Cargando..."
      error: null,      // Para guardar cualquier error que ocurra
      formData: {
        activacion: '',
        causa_clinica: '',
        causa_traumatica: {
          agente_causal: '',
          especificacion: ''
        },
        lesiones: [],
        traslado: {
          tipo: '',
          nombre_hospital: ''
        },
        paciente: {
          nombre: '',
          edad: '',
          sexo: '',
          telefono: ''
        }
      },
      opcionesActivacion: [
        '3MM', '9-1-1', 'Movilidad', 'Seg.Publico', 'Proteccion civil', 'Directo', 'Otro'
      ],
      opcionesCausaClinica: [
        'Cardiovascular', 'Osteoarticular', 'Respiratoria', 'Gastrointestinal', 
        'Ginecobstetrico', 'Renal', 'Neurologico', 'Intoxicacion', 
        'Metabolico', 'Psiquiatrico', 'Emocional', 'Infeccion'
      ],
      opcionesAgenteCausal: [
        'Arma blanca', 'Arma de fuego', 'Motocicleta', 'Automovil', 
        'Bicicleta', 'Biologico', 'Maquinaria', 'Herramienta', 'Caida'
      ],
      opcionesLesiones: [
        'Abrasión', 'Amputación', 'Aplastamiento', 'Avulsión', 
        'Contusión', 'Dolor', 'Edema', 'Fractura', 'Herida punzante', 
        'Herida cortante', 'Laceración', 'Quemadura'
      ],
      opcionesTraslado: [
        'Hospital', 'No amerita', 'No se encontró al paciente', 
        'Se atendió en el lugar', 'Traslado voluntario', 'Otro centro médico'
      ]
    }
  },
  computed: {
    ...mapGetters(['currentUser']),
    pageTitle() {
      if (this.activeNav === 'reportes') {
        if (this.activeModule === 'prehospitalario') {
          return this.activeView === 'formulario' ? 'Registro Prehospitalario' : 'Eventos y Simulacros';
        }
        const moduleName = this.activeModule.charAt(0).toUpperCase() + this.activeModule.slice(1);
        return 'Dashboard ' + moduleName;
      } else {
        return 'Consultas y Estadísticas';
      }
    }
  },
  methods: {
    setActiveModule(module) {
      this.activeModule = module;
      this.activeView = (module === 'prehospitalario') ? 'formulario' : 'default';
      this.showForm = false;
    },
    // Método para cerrar sesión
    handleLogout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    },
    async enviarRegistro() {
      try {
        console.log('Datos enviados:', this.formData);
        this.mensaje = '¡Registro guardado exitosamente! ✅';
        this.tipoMensaje = 'alert-success';
        
        this.resetForm();
        
        setTimeout(() => {
          this.showForm = false;
          this.mensaje = '';
        }, 3000);
      } catch (error) {
        console.error('Error al guardar registro:', error);
        this.mensaje = 'Ocurrió un error. Por favor, intente de nuevo. ❌';
        this.tipoMensaje = 'alert-danger';
      }
    },
    resetForm() {
      this.formData = {
        activacion: '',
        causa_clinica: '',
        causa_traumatica: {
          agente_causal: '',
          especificacion: ''
        },
        lesiones: [],
        traslado: {
          tipo: '',
          nombre_hospital: ''
        },
        paciente: {
          nombre: '',
          edad: '',
          sexo: '',
          telefono: ''
        }
      };
    }
  },
  mounted() {
  // Esto ya lo tienes, sirve para proteger la ruta
  if (!this.$store.getters.isLoggedIn) {
    this.$router.push('/login');
    return; // Detenemos la ejecución si no está logueado
  }

  // --- AÑADE ESTE CÓDIGO ---
  // Ahora, pedimos los datos al servidor
  api.get('/activaciones')
    .then(response => {
      this.activaciones = response.data;
    })
    .catch(err => {
      console.error('Error al cargar activaciones:', err);
      this.error = 'No se pudieron cargar los registros.';
    })
    .finally(() => {
      this.cargando = false;
    });
    
  // --------------------------
  }
}
</script>

<style scoped>
/* Estilos generales (los que ya tenías) */
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
}

.dashboard-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-light);
}

/* Header */
.dashboard-header {
  background: white;
  color: var(--text-dark);
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
  color: var(--primary);
}

.nav-tabs {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  background: var(--bg-dark);
  border-radius: 50px;
  padding: 0.4rem;
  gap: 0.5rem;
}

.nav-tabs li {
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.95rem;
  color: var(--text-gray);
}

.nav-tabs li:hover {
  background-color: white;
  color: var(--primary);
}

.nav-tabs li.active {
  background-color: white;
  color: var(--text-dark);
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
  color: var(--text-gray);
  cursor: pointer;
  transition: var(--transition);
}

.notification-icon:hover {
  color: var(--primary);
  transform: scale(1.1);
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--accent);
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
  background: linear-gradient(45deg, var(--primary), var(--secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  cursor: pointer;
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: var(--transition);
}

.user-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Estilos para el nuevo botón de cerrar sesión */
.btn-logout {
    background: none;
    border: none;
    color: var(--text-gray);
    font-size: 1.4rem;
    cursor: pointer;
    transition: var(--transition);
    padding: 0.5rem;
    border-radius: 50%;
}

.btn-logout:hover {
    color: var(--accent);
    transform: scale(1.1);
    background-color: var(--bg-dark);
}

.btn-logout:active {
    transform: scale(1.0);
}

/* Body */
.dashboard-body {
  display: flex;
  flex: 1;
}

.dashboard-sidebar {
  width: 260px;
  background: white;
  box-shadow: var(--card-shadow);
  padding: 2rem 0;
  z-index: 10;
}

.sidebar-section {
  margin-bottom: 2rem;
}

.sidebar-title {
  padding: 0 2rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  color: var(--text-gray);
  margin-bottom: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.sidebar-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1.2rem 2rem;
  background: transparent;
  border: none;
  text-align: left;
  font-size: 1.05rem;
  color: var(--text-dark);
  cursor: pointer;
  transition: var(--transition);
  border-left: 5px solid transparent;
}

.sidebar-button i {
  margin-right: 1rem;
  color: var(--primary);
  font-size: 1.3rem;
  width: 28px;
  transition: var(--transition);
}

.sidebar-button:hover {
  background-color: var(--primary-light);
}

.sidebar-button.active {
  background-color: var(--bg-light);
  color: var(--text-dark);
  font-weight: 600;
  border-left: 5px solid var(--primary);
}

.sidebar-button.active i {
  color: var(--primary);
}

.dashboard-main {
  flex: 1;
  padding: 2.5rem;
  overflow-y: auto;
  background-color: var(--bg-light);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin: 0;
}

.page-actions button {
  padding: 1rem 2rem;
  background: var(--primary);
  color: #000;
  border: none;
  border-radius: var(--border-radius);
  font-weight: bold; 
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
}

.page-actions button i {
  margin-right: 0.8rem;
  color: #000;
}

.page-actions button:hover {
  background: var(--primary-dark);
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 123, 255, 0.4);
}

.section-menu {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 1.5rem;
  margin-bottom: 2.5rem;
}

.section-buttons {
  display: flex;
  gap: 1.5rem;
}

.section-button {
  flex: 1;
  padding: 1.2rem;
  background: var(--bg-light);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: var(--text-dark);
}

.section-button i {
  margin-right: 0.8rem;
  font-size: 1.3rem;
  color: var(--primary);
}

.section-button.active {
  background: var(--primary-light);
  color: var(--text-dark);
  box-shadow: none;
}

.section-button.active i {
  color: var(--primary);
}

.section-button:hover:not(.active) {
  background: var(--bg-dark);
  transform: translateY(-2px);
}

.main-content {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 3rem;
}

.content-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.content-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin: 0;
}

.text-muted {
  color: var(--text-gray);
  margin-top: 0.5rem;
}

/* Formulario */
.form-container {
  max-width: 100%;
}

.form-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.form-header h2 {
  color: var(--primary-dark);
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.form-grid {
  display: grid;
  gap: 2rem;
}

.form-section {
  padding: 2rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.section-title {
  display: flex;
  align-items: center;
  color: var(--primary);
  border-bottom: 2px solid var(--primary);
  padding-bottom: 0.8rem;
  margin-bottom: 1.8rem;
  font-weight: 600;
  font-size: 1.3rem;
}

.icon-title {
  margin-right: 0.8rem;
  color: var(--primary-dark);
}

.form-label {
  font-weight: bold;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
  display: block;
}

.form-control, .form-select {
  padding: 1rem 1.2rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  transition: border-color 0.3s;
  width: 100%;
}

.form-control:focus, .form-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15);
  outline: none;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.form-check {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  transition: var(--transition);
}

.form-check:hover {
  background: var(--bg-dark);
  transform: translateY(-2px);
}

.form-check-input {
  margin-right: 1rem;
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
}

.form-check-label {
  cursor: pointer;
  font-weight: 500;
  flex: 1;
}

.alert {
  padding: 1.2rem 2rem;
  border-radius: var(--border-radius);
  margin-bottom: 2rem;
  border: 1px solid transparent;
  font-weight: 600;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}

.btn-primary {
  background: var(--primary);
  border: none;
  padding: 1.2rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
  color: #000;
  font-weight: bold;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 123, 255, 0.4);
}

.empty-state {
  padding: 4rem;
  background-color: var(--primary-light);
  border-radius: var(--border-radius);
  text-align: center;
  color: var(--primary);
  box-shadow: var(--card-shadow);
}

.empty-state i {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
  opacity: 0.6;
}

.empty-state p {
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.module-placeholder {
  padding: 4rem;
  text-align: center;
  color: var(--text-gray);
}

.module-placeholder i {
  color: var(--primary);
}

/* Tarjetas de eventos */
.event-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 2.5rem;
}

.event-card {
  background: var(--bg-light);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: var(--transition);
  border: 1px solid var(--border-color);
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
}

.event-card-header {
  padding: 1.5rem 2rem;
  background: var(--primary);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.event-card-body {
  padding: 2rem;
}

.event-type {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 700;
  color: white;
}

.event-type.urgente {
  background-color: var(--accent);
}

.event-type.programado {
  background-color: var(--secondary);
}

.event-title {
  font-size: 1.6rem;
  margin: 0.8rem 0 1.2rem;
  color: var(--primary-dark);
  font-weight: 700;
}

.event-details {
  color: var(--text-gray);
  font-size: 1rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.event-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-gray);
  border-top: 1px solid var(--bg-dark);
  padding-top: 1rem;
}

.event-meta span {
  display: flex;
  align-items: center;
}

.event-meta i {
  margin-right: 0.6rem;
  color: var(--primary);
  font-size: 1rem;
}

/* Gráficas */
.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  margin-bottom: 2.5rem;
}

.chart-container {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--card-shadow);
}

.chart-container h4 {
  color: var(--primary-dark);
  font-weight: 700;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
}

.chart-placeholder {
  height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-gray);
  background: var(--bg-light);
  border-radius: var(--border-radius);
  border: 2px dashed var(--border-color);
}

.chart-placeholder i {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
  opacity: 0.5;
}

.chart-placeholder p {
  font-size: 1.1rem;
  margin: 0;
}

/* Responsive */
@media (max-width: 1200px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 992px) {
  .dashboard-sidebar {
    width: 200px;
  }

  .sidebar-button {
    flex-direction: row;
    padding: 1.2rem 1.5rem;
  }

  .sidebar-button i {
    margin-right: 0.8rem;
    font-size: 1.3rem;
  }

  .sidebar-button span {
    display: inline;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .sidebar-title {
    text-align: left;
    padding: 0 1.5rem;
  }
  
  .event-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-body {
    flex-direction: column;
  }
  
  .dashboard-sidebar {
    width: 100%;
    order: 2;
    padding: 1rem 0;
  }

  .sidebar-section {
    display: flex;
    overflow-x: auto;
    padding: 0 1rem;
    margin-bottom: 0;
    gap: 0.8rem;
    -webkit-overflow-scrolling: touch;
  }

  .sidebar-title {
    display: none;
  }

  .sidebar-button {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    border-radius: var(--border-radius);
    white-space: nowrap;
    border-left: none;
    border-bottom: 3px solid transparent;
  }

  .sidebar-button.active {
    border-left: none;
    border-bottom: 3px solid var(--primary);
  }

  .sidebar-button i {
    margin-right: 0;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
  }
  
  .sidebar-button span {
    display: block;
    font-size: 0.8rem;
  }

  .dashboard-main {
    order: 1;
    padding: 1.5rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .section-buttons {
    flex-direction: column;
  }

  .checkbox-group {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    gap: 1.5rem;
  }

  .nav-tabs {
    width: 100%;
    justify-content: center;
  }

  .event-meta {
    flex-direction: column;
    gap: 0.8rem;
  }
}
</style>