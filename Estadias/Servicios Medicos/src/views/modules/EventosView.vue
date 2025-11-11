<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="page-actions">
        <button @click="toggleView" class="btn btn-primary">
          <i :class="showList ? 'fas fa-plus' : 'fas fa-list'"></i>
          <b>{{ showList ? 'Nuevo Evento' : 'Ver Lista' }}</b>
        </button>
      </div>
    </div>

    <div class="main-content">
      <!-- Formulario de Registro -->
      <div v-if="!showList" class="form-container">
        <div class="form-header">
          <h2>{{ isEditing ? 'Editar Evento' : 'Registro de Evento o Simulacro' }}</h2>
          <p class="text-muted">Complete la información del evento especial, simulacro o cobertura.</p>
        </div>

        <div v-if="mensaje" :class="['alert', error ? 'alert-danger' : 'alert-success']">
          {{ mensaje }}
        </div>

        <form @submit.prevent="registrarEvento" class="event-form">
          <!-- Información Básica del Evento -->
          <div class="form-section card-light">
            <h3 class="section-title">
              <i class="fas fa-info-circle icon-title"></i>
              Información Básica
            </h3>
            
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Tipo de Evento *</label>
                <select v-model="formulario.id_tipo_evento" class="form-select" required @change="onTipoEventoChange">
                  <option :value="null">Seleccione el tipo</option>
                  <option v-for="tipo in catalogos.tipos_evento" :key="tipo.id" :value="tipo.id">
                    {{ tipo.nombre }}
                  </option>
                </select>
              </div>
              
              <div class="col-md-6 mb-3">
                <label class="form-label">Categoría</label>
                <select v-model="formulario.id_categoria" class="form-select">
                  <option :value="null">Seleccione categoría</option>
                  <option v-for="cat in categoriasFiltradas" :key="cat.id" :value="cat.id">
                    {{ cat.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="col-md-12 mb-3">
                <label class="form-label">Nombre del Evento *</label>
                <input 
                  type="text" 
                  v-model="formulario.nombre_evento" 
                  class="form-control" 
                  placeholder="Ej: Simulacro de Evacuación Masiva"
                  required
                >
              </div>
            </div>

            <div class="row">
              <div class="col-md-4 mb-3">
                <label class="form-label">Fecha del Evento *</label>
                <input 
                  type="date" 
                  v-model="formulario.fecha" 
                  class="form-control" 
                  required
                >
              </div>
              
              <div class="col-md-4 mb-3">
                <label class="form-label">Hora de Inicio *</label>
                <input 
                  type="time" 
                  v-model="formulario.hora_inicio" 
                  class="form-control" 
                  required
                >
              </div>
              
              <div class="col-md-4 mb-3">
                <label class="form-label">Hora de Finalización</label>
                <input 
                  type="time" 
                  v-model="formulario.hora_fin" 
                  class="form-control"
                >
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Estado</label>
                <select v-model="formulario.estado" class="form-select">
                  <option value="planificado">Planificado</option>
                  <option value="en_curso">En Curso</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              
              <div class="col-md-6 mb-3">
                <label class="form-label">Responsable</label>
                <select v-model="formulario.id_responsable" class="form-select">
                  <option :value="null">Seleccione responsable</option>
                  <option v-for="usuario in catalogos.personal" :key="usuario.id" :value="usuario.id">
                    {{ usuario.nombre }}
                  </option>
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
                  v-model="formulario.lugar" 
                  class="form-control" 
                  placeholder="Ej: Estadio Jalisco"
                  required
                >
              </div>
              
              <div class="col-md-6 mb-3">
                <label class="form-label">Dirección Completa</label>
                <input 
                  type="text" 
                  v-model="formulario.direccion" 
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
                  v-model="formulario.organizador" 
                  class="form-control" 
                  placeholder="Ej: Protección Civil Municipal"
                >
              </div>
              
              <div class="col-md-6 mb-3">
                <label class="form-label">Institución Responsable</label>
                <input 
                  type="text" 
                  v-model="formulario.institucion_responsable" 
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
                  v-model="formulario.participantes_esperados" 
                  class="form-control" 
                  placeholder="Ej: 500"
                  min="0"
                >
              </div>
              
              <div class="col-md-6 mb-3">
                <label class="form-label">Número de Ambulancias Asignadas</label>
                <input 
                  type="number" 
                  v-model="formulario.ambulancias_asignadas" 
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
                  v-model="formulario.personal_medico" 
                  class="form-control" 
                  placeholder="Ej: 8"
                  min="0"
                >
              </div>
              
              <div class="col-md-6 mb-3">
                <label class="form-label">Personal de Apoyo</label>
                <input 
                  type="number" 
                  v-model="formulario.personal_apoyo" 
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
                  v-model="formulario.objetivos" 
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
                  v-model="formulario.descripcion" 
                  class="form-control" 
                  rows="4"
                  placeholder="Proporcione una descripción completa del evento..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Unidades que Atienden -->
          <div class="form-section card-light">
            <h3 class="section-title">
              <i class="fas fa-ambulance icon-title"></i>
              Unidades que Atienden
            </h3>
            
            <div class="checkbox-group unidades-grid">
              <div v-for="unidad in unidadesAtencion" :key="unidad.value" class="form-check unidad-item">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  :value="unidad.value" 
                  v-model="formulario.unidades_atienden" 
                  :id="'unidad-' + unidad.value"
                >
                <label class="form-check-label" :for="'unidad-' + unidad.value">
                  <span class="unidad-codigo">{{ unidad.value }}</span>
                  <span class="unidad-descripcion">{{ unidad.descripcion }}</span>
                </label>
              </div>
            </div>

            <div class="row mt-3">
              <div class="col-md-12 mb-3">
                <label class="form-label">Observaciones de las Unidades</label>
                <textarea 
                  v-model="formulario.observaciones_unidades" 
                  class="form-control" 
                  rows="2"
                  placeholder="Observaciones adicionales sobre las unidades asignadas..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Personal Participante -->
          <div class="form-section card-light">
            <h3 class="section-title">
              <i class="fas fa-users icon-title"></i>
              Personal Participante
            </h3>
            
            <div class="mb-3">
              <label class="form-label">Personal Participante (Múltiple Selección)</label>
              <select v-model="formulario.personal_participante_ids" class="form-select" multiple size="5">
                <option v-for="usuario in catalogos.personal" :key="usuario.id" :value="usuario.id">
                  {{ usuario.nombre }}
                </option>
              </select>
              <small class="text-muted">Mantén presionada la tecla Ctrl/Cmd para seleccionar varios.</small>
            </div>
          </div>

          <!-- Reporte y Lecciones -->
          <div class="form-section card-light">
            <h3 class="section-title">
              <i class="fas fa-file-alt icon-title"></i>
              Reporte y Lecciones Aprendidas
            </h3>
            
            <div class="row">
              <div class="col-md-12 mb-3">
                <label class="form-label">Observaciones/Reporte</label>
                <textarea 
                  v-model="formulario.observaciones" 
                  class="form-control" 
                  rows="3"
                  placeholder="Detalles del evento, incidencias, resultados..."
                ></textarea>
              </div>
            </div>

            <div class="row">
              <div class="col-md-12 mb-3">
                <label class="form-label">Lecciones Aprendidas</label>
                <textarea 
                  v-model="formulario.lecciones_aprendidas" 
                  class="form-control" 
                  rows="3"
                  placeholder="Puntos a mejorar, aspectos destacados, recomendaciones..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="form-actions">
            <button type="button" @click="toggleView" class="btn btn-secondary">
              <i class="fas fa-times me-2"></i>
              Cancelar
            </button>
            
            <button type="submit" class="btn btn-primary" :disabled="enviando">
              <i :class="['fas', enviando ? 'fa-spinner fa-spin' : 'fa-save']" class="me-2"></i>
              {{ isEditing ? (enviando ? 'Actualizando...' : 'Guardar Cambios') : (enviando ? 'Guardando...' : 'Guardar Evento') }}
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
              <option :value="null">Todos los tipos</option>
              <option v-for="tipo in catalogos.tipos_evento" :key="tipo.id" :value="tipo.id">
                {{ tipo.nombre }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="loadingList" class="text-center py-4">
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
              <span class="evento-fecha">{{ formatFecha(evento.fecha) }}</span>
              <span :class="['evento-badge', `badge-${evento.estado}`]">
                {{ formatEstado(evento.estado) }}
              </span>
            </div>
            
            <div class="evento-body">
              <h5 class="evento-titulo">{{ evento.nombre_evento }}</h5>
              <p class="evento-tipo">{{ getTipoEvento(evento.id_tipo_evento) }}</p>
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
              <button @click="editarEvento(evento)" class="btn btn-sm btn-outline-secondary">
                <i class="fas fa-edit me-1"></i>Editar
              </button>
              <button @click="eliminarEvento(evento)" class="btn btn-sm btn-outline-danger">
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
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

export default {
  name: 'EventosView',
  setup() {
    const showList = ref(true);
    const isEditing = ref(false);
    const loadingList = ref(true);
    const enviando = ref(false);
    const eventos = ref([]);
    const catalogos = ref({
      tipos_evento: [],
      categorias: [],
      personal: [],
      unidades_transporte: []
    });
    const formulario = ref(resetFormularioState());
    const mensaje = ref('');
    const error = ref(false);
    const filtroBusqueda = ref('');
    const filtroTipo = ref(null);

    const unidadesAtencion = computed(() => {
        return (catalogos.value.unidades_transporte || []).map(u => ({
            value: u.codigo,
            descripcion: u.descripcion
        }));
    });

    const pageTitle = computed(() => (showList.value 
        ? 'Eventos y Simulacros' 
        : (isEditing.value ? 'Editar Evento' : 'Nuevo Registro de Evento')
    ));

    const categoriasFiltradas = computed(() => {
      if (!formulario.value.id_tipo_evento) {
        return catalogos.value.categorias || [];
      }
      return (catalogos.value.categorias || []).filter(cat => 
        cat.id_tipo_evento == formulario.value.id_tipo_evento
      );
    });

    const eventosFiltrados = computed(() => {
      let filtered = eventos.value;
      
      if (filtroBusqueda.value) {
        const search = filtroBusqueda.value.toLowerCase();
        filtered = filtered.filter(evento => 
          evento.nombre_evento.toLowerCase().includes(search) ||
          (evento.descripcion && evento.descripcion.toLowerCase().includes(search)) ||
          (evento.lugar && evento.lugar.toLowerCase().includes(search))
        );
      }
      
      if (filtroTipo.value) {
        filtered = filtered.filter(evento => evento.id_tipo_evento == filtroTipo.value);
      }
      
      return filtered;
    });

    function resetFormularioState() {
      return {
        id: null,
        nombre_evento: '',
        id_tipo_evento: null,
        id_categoria: null,
        fecha: new Date().toISOString().split('T')[0],
        hora_inicio: '08:00',
        hora_fin: '17:00',
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
        id_responsable: null,
        observaciones: '',
        lecciones_aprendidas: '',
        unidades_atienden: [],
        personal_participante_ids: [],
        observaciones_unidades: ''
      };
    }

    const getPayload = () => {
        const payload = { ...formulario.value };
        
        // Convertir strings vacíos a null
        const camposAConvertirNull = [
          'direccion', 'organizador', 'institucion_responsable', 
          'objetivos', 'descripcion', 'observaciones', 
          'lecciones_aprendidas', 'observaciones_unidades',
          'id_categoria', 'id_responsable'
        ];
        
        for (const key of camposAConvertirNull) {
            if (payload[key] === '' || payload[key] === undefined) {
                payload[key] = null;
            }
        }

        // Asegurar que los campos numéricos sean null si están vacíos
        const camposNumericos = [
          'participantes_esperados', 'ambulancias_asignadas', 
          'personal_medico', 'personal_apoyo'
        ];
        
        for (const key of camposNumericos) {
            if (payload[key] === '' || payload[key] === undefined) {
                payload[key] = null;
            }
        }
        
        return payload;
    };

    const toggleView = () => {
      showList.value = !showList.value;
      if (showList.value) {
        fetchEventos();
        isEditing.value = false;
      } else {
        mensaje.value = '';
        error.value = false;
        if (!isEditing.value) {
            formulario.value = resetFormularioState();
        }
      }
    };

    const onTipoEventoChange = () => {
      formulario.value.id_categoria = null;
    };

    const fetchCatalogos = async () => {
      loadingList.value = true;
      try {
        const res = await api.get('/catalogos');
        const d = res.data || {};
        
        // Agregar fallbacks para cada propiedad
        catalogos.value.tipos_evento = d.tipos_evento || [];
        catalogos.value.categorias = d.categorias || [];
        catalogos.value.personal = d.personal || [];
        catalogos.value.unidades_transporte = d.unidades_transporte || [];
        
      } catch (err) {
        console.error('Error cargando catálogos', err);
        mensaje.value = 'No se pudieron cargar las listas de catálogos.';
        error.value = true;
        
        // Inicializar arrays vacíos para evitar errores
        catalogos.value.tipos_evento = [];
        catalogos.value.categorias = [];
        catalogos.value.personal = [];
        catalogos.value.unidades_transporte = [];
      } finally {
          loadingList.value = false; 
      }
    };

    const fetchEventos = async () => {
      loadingList.value = true;
      try {
        const res = await api.get('/eventos'); 
        eventos.value = res.data || [];
      } catch (err) {
        console.error('Error cargando eventos', err);
        eventos.value = [];
      } finally {
        loadingList.value = false;
      }
    };

    const editarEvento = async (evento) => {
        try {
            const res = await api.get(`/eventos/${evento.id}`);
            const eventoCompleto = res.data;

            formulario.value = {
                ...eventoCompleto,
                id_tipo_evento: eventoCompleto.id_tipo_evento || null,
                id_categoria: eventoCompleto.id_categoria || null,
                id_responsable: eventoCompleto.id_responsable || null,
                participantes_esperados: eventoCompleto.participantes_esperados === null ? null : Number(eventoCompleto.participantes_esperados),
                ambulancias_asignadas: eventoCompleto.ambulancias_asignadas === null ? null : Number(eventoCompleto.ambulancias_asignadas),
                personal_medico: eventoCompleto.personal_medico === null ? null : Number(eventoCompleto.personal_medico),
                personal_apoyo: eventoCompleto.personal_apoyo === null ? null : Number(eventoCompleto.personal_apoyo),
                unidades_atienden: eventoCompleto.unidades_atienden || [],
                personal_participante_ids: eventoCompleto.personal_participante_ids || [],
            };
            
            isEditing.value = true;
            showList.value = false;
            mensaje.value = '';
            error.value = false;

        } catch (err) {
            console.error('Error al cargar detalles del evento:', err);
            mensaje.value = 'Error al cargar los datos del evento para edición.';
            error.value = true;
        }
    };

    const actualizarEvento = async () => {
        enviando.value = true;
        mensaje.value = '';
        error.value = false;
        const payload = getPayload(); 
        
        try {
            const resp = await api.put(`/eventos/${payload.id}`, payload);
            mensaje.value = `Evento "${resp.data.data.nombre_evento}" actualizado exitosamente.`;
            error.value = false;
            
            setTimeout(() => {
              toggleView();
            }, 2000);

        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Verifique que los campos obligatorios estén completos.';
            mensaje.value = `Error al actualizar el evento: ${errorMsg}`;
            error.value = true;
            console.error(err);
        } finally {
            enviando.value = false;
        }
    }

    const registrarEvento = async () => {
        if (isEditing.value) {
            await actualizarEvento();
        } else {
            enviando.value = true;
            mensaje.value = '';
            error.value = false;
            const payload = getPayload(); 

            try {
                const resp = await api.post('/eventos', payload);
                mensaje.value = `Evento "${resp.data.data.nombre_evento}" guardado exitosamente.`;
                error.value = false;
                
                setTimeout(() => {
                    toggleView();
                }, 2000);

            } catch (err) {
                const errorMsg = err.response?.data?.error || 'Verifique que los campos obligatorios estén completos.';
                mensaje.value = `Error al guardar el evento: ${errorMsg}`;
                error.value = true;
                console.error(err);
            } finally {
                enviando.value = false;
            }
        }
    };

    const eliminarEvento = async (evento) => {
        if (!confirm(`¿Está seguro de que desea eliminar el evento "${evento.nombre_evento}"? Esta acción es irreversible.`)) {
            return;
        }

        try {
            await api.delete(`/eventos/${evento.id}`);
            
            alert(`Evento "${evento.nombre_evento}" eliminado exitosamente.`);

            await fetchEventos(); 

        } catch (err) {
            console.error('Error al eliminar el evento:', err);
            alert('Error al eliminar el evento. Intente de nuevo.');
        }
    };

    const formatFecha = (fecha) => {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatEstado = (estado) => {
      const estados = {
        planificado: 'Planificado',
        en_curso: 'En Curso',
        completado: 'Completado',
        cancelado: 'Cancelado'
      };
      return estados[estado] || estado;
    };

    const getTipoEvento = (idTipo) => {
      const tipo = catalogos.value.tipos_evento.find(t => t.id == idTipo);
      return tipo ? tipo.nombre : 'Sin tipo';
    };

    onMounted(() => {
      fetchCatalogos();
      fetchEventos();
    });

    return {
      showList,
      isEditing,
      pageTitle,
      toggleView,
      catalogos,
      formulario,
      eventos,
      loadingList,
      enviando,
      mensaje,
      error,
      filtroBusqueda,
      filtroTipo,
      unidadesAtencion,
      categoriasFiltradas,
      eventosFiltrados,
      registrarEvento,
      editarEvento,
      eliminarEvento, 
      onTipoEventoChange,
      formatFecha,
      formatEstado,
      getTipoEvento
    };
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

.btn-outline-secondary {
  background: transparent;
  border: 1px solid #6c757d;
  color: #6c757d;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
}

.btn-outline-danger {
  background: transparent;
  border: 1px solid #dc3545;
  color: #dc3545;
}

.btn-outline-danger:hover {
  background: #dc3545;
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

.col-md-6, .col-md-12, .col-md-4 {
  padding: 0 0.75rem;
  flex: 1 0 0%;
}

.col-md-6 {
  flex: 0 0 50%;
  max-width: 50%;
}

.col-md-4 {
  flex: 0 0 33.333333%;
  max-width: 33.333333%;
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
  
  .col-md-6, .col-md-4 {
    flex: 0 0 100%;
    max-width: 100%;
  }
  
  .unidades-grid {
    grid-template-columns: 1fr;
  }
}
</style>