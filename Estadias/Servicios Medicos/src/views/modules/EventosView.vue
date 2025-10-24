<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Eventos y Simulacros</h1>
      <div class="page-actions">
        <button @click="showForm = !showForm" class="btn btn-primary">
          <i :class="showForm ? 'fas fa-list' : 'fas fa-plus'"></i>
          <b>{{ showForm ? 'Ver Lista' : 'Nuevo Evento' }}</b>
        </button>
      </div>
    </div>

    <div class="main-content">
      <!-- Formulario de Registro -->
      <div v-if="showForm" class="form-container">
        <div class="form-header">
          <h2>Registro de Evento o Simulacro</h2>
          <p class="text-muted">Complete la información del evento especial, simulacro o cobertura.</p>
        </div>

        <div v-if="mensaje" :class="['alert', tipoMensaje]">
          {{ mensaje }}
        </div>

        <form @submit.prevent="enviarEvento" class="event-form">
          <!-- Información Básica del Evento -->
          <div class="form-section card-light">
            <h3 class="section-title">
              <i class="fas fa-info-circle icon-title"></i>
              Información Básica
            </h3>
            
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Tipo de Evento *</label>
                <select v-model="formData.tipo_evento" class="form-select" required @change="onTipoEventoChange">
                  <option value="">Seleccione el tipo</option>
                  <option v-for="tipo in tiposEvento" :key="tipo.value" :value="tipo.value">
                    {{ tipo.text }}
                  </option>
                </select>
              </div>
              
              <div class="col-md-6 mb-3">
                <label class="form-label">Categoría *</label>
                <select v-model="formData.categoria" class="form-select" required>
                  <option value="">Seleccione categoría</option>
                  <option v-for="cat in categoriasFiltradas" :key="cat.value" :value="cat.value">
                    {{ cat.text }}
                  </option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="col-md-12 mb-3">
                <label class="form-label">Nombre del Evento *</label>
                <input 
                  type="text" 
                  v-model="formData.nombre_evento" 
                  class="form-control" 
                  placeholder="Ej: Simulacro de Evacuación Masiva"
                  required
                >
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Fecha del Evento *</label>
                <input 
                  type="date" 
                  v-model="formData.fecha_evento" 
                  class="form-control" 
                  required
                >
              </div>
              
              <div class="col-md-6 mb-3">
                <label class="form-label">Hora de Inicio *</label>
                <input 
                  type="time" 
                  v-model="formData.hora_inicio" 
                  class="form-control" 
                  required
                >
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Hora de Finalización</label>
                <input 
                  type="time" 
                  v-model="formData.hora_fin" 
                  class="form-control"
                >
              </div>
              
              <div class="col-md-6 mb-3">
                <label class="form-label">Estado</label>
                <select v-model="formData.estado" class="form-select">
                  <option value="planificado">Planificado</option>
                  <option value="en_curso">En Curso</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Ubicación y Organización -->
          <div class="form-section card-light">
            <h3 class="section-title">
              <i class="fas fa-map-marker-alt icon-title"></i>
              Ubicación y Organización
            </h3>
            
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Lugar *</label>
                <input 
                  type="text" 
                  v-model="formData.lugar" 
                  class="form-control" 
                  placeholder="Ej: Estadio Jalisco"
                  required
                >
              </div>
              
              <div class="col-md-6 mb-3">
                <label class="form-label">Dirección Completa</label>
                <input 
                  type="text" 
                  v-model="formData.direccion" 
                  class="form-control" 
                  placeholder="Ej: Av. Las Américas 1234"
                >
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Organizador Principal</label>
                <input 
                  type="text" 
                  v-model="formData.organizador" 
                  class="form-control" 
                  placeholder="Ej: Protección Civil Municipal"
                >
              </div>
              
              <div class="col-md-6 mb-3">
                <label class="form-label">Institución Responsable</label>
                <input 
                  type="text" 
                  v-model="formData.institucion_responsable" 
                  class="form-control" 
                  placeholder="Ej: CV Tala"
                >
              </div>
            </div>
          </div>

          <!-- Detalles Específicos -->
          <div class="form-section card-light">
            <h3 class="section-title">
              <i class="fas fa-clipboard-list icon-title"></i>
              Detalles del Evento
            </h3>
            
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Número Esperado de Participantes</label>
                <input 
                  type="number" 
                  v-model="formData.participantes_esperados" 
                  class="form-control" 
                  placeholder="Ej: 500"
                  min="0"
                >
              </div>
              
              <div class="col-md-6 mb-3">
                <label class="form-label">Número de Ambulancias Asignadas</label>
                <input 
                  type="number" 
                  v-model="formData.ambulancias_asignadas" 
                  class="form-control" 
                  placeholder="Ej: 3"
                  min="0"
                >
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Personal Médico Asignado</label>
                <input 
                  type="number" 
                  v-model="formData.personal_medico" 
                  class="form-control" 
                  placeholder="Ej: 8"
                  min="0"
                >
              </div>
              
              <div class="col-md-6 mb-3">
                <label class="form-label">Personal de Apoyo</label>
                <input 
                  type="number" 
                  v-model="formData.personal_apoyo" 
                  class="form-control" 
                  placeholder="Ej: 12"
                  min="0"
                >
              </div>
            </div>

            <div class="row">
              <div class="col-md-12 mb-3">
                <label class="form-label">Objetivos del Evento</label>
                <textarea 
                  v-model="formData.objetivos" 
                  class="form-control" 
                  rows="3"
                  placeholder="Describa los objetivos principales del evento..."
                ></textarea>
              </div>
            </div>

            <div class="row">
              <div class="col-md-12 mb-3">
                <label class="form-label">Descripción Detallada</label>
                <textarea 
                  v-model="formData.descripcion" 
                  class="form-control" 
                  rows="4"
                  placeholder="Proporcione una descripción completa del evento..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Unidad que Atiende -->
          <div class="form-section card-light">
            <h3 class="section-title">
              <i class="fas fa-ambulance icon-title"></i>
              Unidad que Atiende
            </h3>
            
            <div class="checkbox-group unidades-grid">
              <div v-for="unidad in unidadesAtencion" :key="unidad" class="form-check unidad-item">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  :value="unidad" 
                  v-model="formData.unidades_atienden" 
                  :id="'unidad-' + unidad"
                >
                <label class="form-check-label" :for="'unidad-' + unidad">
                  <span class="unidad-codigo">{{ unidad }}</span>
                  <span class="unidad-descripcion">{{ getDescripcionUnidad(unidad) }}</span>
                </label>
              </div>
            </div>

            <div class="row mt-3">
              <div class="col-md-12 mb-3">
                <label class="form-label">Observaciones de las Unidades</label>
                <textarea 
                  v-model="formData.observaciones_unidades" 
                  class="form-control" 
                  rows="2"
                  placeholder="Observaciones adicionales sobre las unidades asignadas..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="form-actions">
            <button type="button" @click="cancelarRegistro" class="btn btn-secondary">
              <i class="fas fa-times me-2"></i>
              Cancelar
            </button>
            
            <button type="submit" class="btn btn-primary" :disabled="enviando">
              <i class="fas fa-save me-2"></i>
              {{ enviando ? 'Guardando...' : 'Guardar Evento' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de Eventos -->
      <div v-else>
        <div class="content-header">
          <h2 class="content-title">Eventos Registrados</h2>
          <div class="search-filter">
            <input 
              type="text" 
              v-model="filtroBusqueda" 
              placeholder="Buscar eventos..." 
              class="form-control search-input"
            >
            <select v-model="filtroTipo" class="form-select filter-select">
              <option value="">Todos los tipos</option>
              <option v-for="tipo in tiposEvento" :key="tipo.value" :value="tipo.value">
                {{ tipo.text }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="cargando" class="text-center py-4">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
          <p>Cargando eventos...</p>
        </div>

        <div v-else-if="eventosFiltrados.length === 0" class="empty-state">
          <i class="fas fa-calendar-times fa-3x mb-3"></i>
          <h4>No hay eventos registrados</h4>
          <p class="text-muted">Comience creando un nuevo evento o simulacro.</p>
        </div>

        <div v-else class="eventos-grid">
          <div 
            v-for="evento in eventosFiltrados" 
            :key="evento.id" 
            class="evento-card card-shadow"
          >
            <div class="evento-header">
              <span class="evento-fecha">{{ formatFecha(evento.fecha_evento) }}</span>
              <span :class="['evento-badge', `badge-${evento.estado}`]">
                {{ formatEstado(evento.estado) }}
              </span>
            </div>
            
            <div class="evento-body">
              <h5 class="evento-titulo">{{ evento.nombre_evento }}</h5>
              <p class="evento-tipo">{{ getTipoTexto(evento.tipo_evento) }}</p>
              <p class="evento-descripcion">{{ evento.descripcion }}</p>
              
              <div class="evento-info">
                <div class="info-item">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ evento.lugar }}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-clock"></i>
                  <span>{{ evento.hora_inicio }}</span>
                </div>
                <div class="info-item" v-if="evento.participantes_esperados">
                  <i class="fas fa-users"></i>
                  <span>{{ evento.participantes_esperados }} participantes</span>
                </div>
                <div class="info-item" v-if="evento.unidades_atienden && evento.unidades_atienden.length > 0">
                  <i class="fas fa-ambulance"></i>
                  <span>{{ evento.unidades_atienden.join(', ') }}</span>
                </div>
              </div>
            </div>
            
            <div class="evento-actions">
              <button class="btn btn-sm btn-outline-primary">
                <i class="fas fa-eye me-1"></i>Ver
              </button>
              <button class="btn btn-sm btn-outline-secondary">
                <i class="fas fa-edit me-1"></i>Editar
              </button>
              <button class="btn btn-sm btn-outline-danger">
                <i class="fas fa-trash me-1"></i>Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EventosView',
  data() {
    return {
      showForm: false,
      enviando: false,
      cargando: false,
      mensaje: '',
      tipoMensaje: '',
      filtroBusqueda: '',
      filtroTipo: '',
      eventos: [],
      formData: {
        tipo_evento: '',
        categoria: '',
        nombre_evento: '',
        fecha_evento: '',
        hora_inicio: '',
        hora_fin: '',
        estado: 'planificado',
        lugar: '',
        direccion: '',
        organizador: '',
        institucion_responsable: '',
        participantes_esperados: null,
        ambulancias_asignadas: null,
        personal_medico: null,
        personal_apoyo: null,
        objetivos: '',
        descripcion: '',
        unidades_atienden: [],
        observaciones_unidades: ''
      },
      tiposEvento: [
        { value: 'simulacro', text: 'Simulacro' },
        { value: 'evento_masivo', text: 'Evento Masivo' },
        { value: 'deportivo', text: 'Evento Deportivo' },
        { value: 'cultural', text: 'Evento Cultural' },
        { value: 'capacitacion', text: 'Capacitación' },
        { value: 'cobertura', text: 'Cobertura Especial' },
        { value: 'otro', text: 'Otro' }
      ],
      categorias: [
        { value: 'evacuacion', text: 'Evacuación', tipos: ['simulacro'] },
        { value: 'incendio', text: 'Incendio', tipos: ['simulacro'] },
        { value: 'sismo', text: 'Sismo', tipos: ['simulacro'] },
        { value: 'inundacion', text: 'Inundación', tipos: ['simulacro'] },
        { value: 'materiales_peligrosos', text: 'Materiales Peligrosos', tipos: ['simulacro'] },
        { value: 'concierto', text: 'Concierto', tipos: ['evento_masivo', 'cultural'] },
        { value: 'feria', text: 'Feria', tipos: ['evento_masivo', 'cultural'] },
        { value: 'festival', text: 'Festival', tipos: ['evento_masivo', 'cultural'] },
        { value: 'futbol', text: 'Fútbol', tipos: ['deportivo'] },
        { value: 'maraton', text: 'Maratón', tipos: ['deportivo'] },
        { value: 'ciclismo', text: 'Ciclismo', tipos: ['deportivo'] },
        { value: 'primeros_auxilios', text: 'Primeros Auxilios', tipos: ['capacitacion'] },
        { value: 'rescate', text: 'Rescate', tipos: ['capacitacion'] },
        { value: 'proteccion_civil', text: 'Protección Civil', tipos: ['cobertura'] },
        { value: 'seguridad_publica', text: 'Seguridad Pública', tipos: ['cobertura'] },
        { value: 'otro', text: 'Otro', tipos: ['otro'] }
      ],
      unidadesAtencion: ['SM01', 'SM02', 'SM03', 'SM04', 'SM05', 'B2', 'M6', 'M7']
    }
  },
  computed: {
    categoriasFiltradas() {
      if (!this.formData.tipo_evento) {
        return this.categorias;
      }
      return this.categorias.filter(cat => 
        cat.tipos.includes(this.formData.tipo_evento) || cat.tipos.includes('otro')
      );
    },
    eventosFiltrados() {
      let filtered = this.eventos;
      
      if (this.filtroBusqueda) {
        const search = this.filtroBusqueda.toLowerCase();
        filtered = filtered.filter(evento => 
          evento.nombre_evento.toLowerCase().includes(search) ||
          evento.descripcion.toLowerCase().includes(search) ||
          evento.lugar.toLowerCase().includes(search)
        );
      }
      
      if (this.filtroTipo) {
        filtered = filtered.filter(evento => evento.tipo_evento === this.filtroTipo);
      }
      
      return filtered;
    }
  },
  methods: {
    getDescripcionUnidad(codigo) {
      const descripciones = {
        'SM01': 'Unidad de Soporte Médico 01',
        'SM02': 'Unidad de Soporte Médico 02',
        'SM03': 'Unidad de Soporte Médico 03',
        'SM04': 'Unidad de Soporte Médico 04',
        'SM05': 'Unidad de Soporte Médico 05',
        'B2': 'Unidad de Bomberos 2',
        'M6': 'Unidad Móvil 6',
        'M7': 'Unidad Móvil 7'
      };
      return descripciones[codigo] || 'Unidad de Atención';
    },
    
    onTipoEventoChange() {
      // Reset categoria cuando cambia el tipo
      this.formData.categoria = '';
    },
    
    async enviarEvento() {
      this.enviando = true;
      
      try {
        // Simular envío a API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Aquí iría la llamada real a la API
        // await api.post('/eventos', this.formData);
        
        this.mensaje = 'Evento registrado exitosamente! ✅';
        this.tipoMensaje = 'alert-success';
        
        // Agregar a la lista local (en producción vendría de la API)
        const nuevoEvento = {
          id: Date.now(),
          ...this.formData
        };
        this.eventos.unshift(nuevoEvento);
        
        this.resetForm();
        
        setTimeout(() => {
          this.showForm = false;
          this.mensaje = '';
        }, 3000);
        
      } catch (error) {
        console.error('Error al guardar evento:', error);
        this.mensaje = 'Error al guardar el evento. Intente nuevamente. ❌';
        this.tipoMensaje = 'alert-danger';
      } finally {
        this.enviando = false;
      }
    },
    
    cancelarRegistro() {
      this.resetForm();
      this.showForm = false;
      this.mensaje = '';
    },
    
    resetForm() {
      this.formData = {
        tipo_evento: '',
        categoria: '',
        nombre_evento: '',
        fecha_evento: '',
        hora_inicio: '',
        hora_fin: '',
        estado: 'planificado',
        lugar: '',
        direccion: '',
        organizador: '',
        institucion_responsable: '',
        participantes_esperados: null,
        ambulancias_asignadas: null,
        personal_medico: null,
        personal_apoyo: null,
        objetivos: '',
        descripcion: '',
        unidades_atienden: [],
        observaciones_unidades: ''
      };
    },
    
    formatFecha(fecha) {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    formatEstado(estado) {
      const estados = {
        planificado: 'Planificado',
        en_curso: 'En Curso',
        completado: 'Completado',
        cancelado: 'Cancelado'
      };
      return estados[estado] || estado;
    },
    
    getTipoTexto(tipo) {
      const tipoObj = this.tiposEvento.find(t => t.value === tipo);
      return tipoObj ? tipoObj.text : tipo;
    },
    
    cargarEventos() {
      // Simular carga de eventos
      this.cargando = true;
      setTimeout(() => {
        this.eventos = [
          {
            id: 1,
            tipo_evento: 'simulacro',
            nombre_evento: 'Simulacro de Evacuación por Sismo',
            fecha_evento: '2024-01-15',
            hora_inicio: '09:00',
            estado: 'completado',
            lugar: 'Plaza Central',
            descripcion: 'Simulacro de evacuación masiva por sismo de magnitud 7.5',
            participantes_esperados: 1500,
            unidades_atienden: ['SM01', 'SM03', 'B2']
          },
          {
            id: 2,
            tipo_evento: 'deportivo',
            nombre_evento: 'Maratón Anual Ciudad',
            fecha_evento: '2024-02-20',
            hora_inicio: '07:00',
            estado: 'planificado',
            lugar: 'Parque Metropolitano',
            descripcion: 'Maratón anual con participación de 3000 corredores',
            participantes_esperados: 3000,
            unidades_atienden: ['SM02', 'SM04', 'M6', 'M7']
          }
        ];
        this.cargando = false;
      }, 1000);
    }
  },
  mounted() {
    this.cargarEventos();
  }
}
</script>

<style scoped>
/* Estilos base del dashboard */
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
  color: #0056b3;
  margin: 0;
}

.main-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 3rem;
}

/* Estilos del formulario */
.form-container {
  max-width: 100%;
}

.form-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.form-header h2 {
  color: #0056b3;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.event-form {
  display: grid;
  gap: 2rem;
}

.form-section {
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #dee2e6;
  background: #f8f9fa;
}

.section-title {
  display: flex;
  align-items: center;
  color: #007bff;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.8rem;
  margin-bottom: 1.8rem;
  font-weight: 600;
  font-size: 1.3rem;
}

.icon-title {
  margin-right: 0.8rem;
  color: #0056b3;
}

.form-label {
  font-weight: bold;
  color: #343a40;
  margin-bottom: 0.5rem;
  display: block;
}

.form-control, .form-select {
  padding: 1rem 1.2rem;
  border-radius: 12px;
  border: 1px solid #dee2e6;
  transition: border-color 0.3s;
  width: 100%;
}

.form-control:focus, .form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15);
  outline: none;
}

/* Estilos específicos para Unidades que Atienden */
.unidades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.unidad-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.unidad-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.unidad-codigo {
  font-weight: 700;
  color: #007bff;
  font-size: 1.1rem;
}

.unidad-descripcion {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: normal;
}

/* Botones */
.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #007bff;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 123, 255, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
  transform: translateY(-2px);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-outline-primary {
  background: transparent;
  border: 1px solid #007bff;
  color: #007bff;
}

.btn-outline-primary:hover {
  background: #007bff;
  color: white;
}

/* Alertas */
.alert {
  padding: 1.2rem 2rem;
  border-radius: 12px;
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

/* Acciones del formulario */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #dee2e6;
}

/* Lista de eventos */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.content-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0056b3;
  margin: 0;
}

.search-filter {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input, .filter-select {
  min-width: 200px;
}

/* Grid de eventos */
.eventos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.evento-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #dee2e6;
  overflow: hidden;
  transition: all 0.3s ease;
}

.evento-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.evento-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.evento-fecha {
  font-weight: 600;
  color: #495057;
}

.evento-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-planificado {
  background: #fff3cd;
  color: #856404;
}

.badge-en_curso {
  background: #d1ecf1;
  color: #0c5460;
}

.badge-completado {
  background: #d4edda;
  color: #155724;
}

.badge-cancelado {
  background: #f8d7da;
  color: #721c24;
}

.evento-body {
  padding: 1.5rem;
}

.evento-titulo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 0.5rem;
}

.evento-tipo {
  color: #007bff;
  font-weight: 600;
  margin-bottom: 1rem;
}

.evento-descripcion {
  color: #6c757d;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.evento-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
  font-size: 0.9rem;
}

.info-item i {
  color: #007bff;
  width: 16px;
}

.evento-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

/* Estados vacíos */
.empty-state {
  padding: 4rem;
  text-align: center;
  color: #6c757d;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 12px;
}

.empty-state i {
  color: #007bff;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.text-center {
  text-align: center;
}

.py-4 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

/* Utilidades */
.card-shadow {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-light {
  background: #f8f9fa;
}

.text-muted {
  color: #6c757d;
}

.mb-3 {
  margin-bottom: 1rem !important;
}

.mt-3 {
  margin-top: 1rem !important;
}

.me-2 {
  margin-right: 0.5rem;
}

.me-1 {
  margin-right: 0.25rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -0.75rem;
}

.col-md-6, .col-md-12 {
  padding: 0 0.75rem;
  flex: 1 0 0%;
}

.col-md-6 {
  flex: 0 0 50%;
  max-width: 50%;
}

.col-md-12 {
  flex: 0 0 100%;
  max-width: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .search-filter {
    flex-direction: column;
    width: 100%;
  }
  
  .search-input, .filter-select {
    min-width: 100%;
  }
  
  .eventos-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
  
  .unidades-grid {
    grid-template-columns: 1fr;
  }
}
</style>