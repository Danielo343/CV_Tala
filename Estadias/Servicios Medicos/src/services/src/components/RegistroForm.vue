<script>
import { ref } from 'vue';
import { registrosService } from '@/services/api';

export default {
  name: 'RegistroForm',
  setup() {
    const formData = ref({
      activacion: '',
      causa_clinica: '',
      causa_traumatica: '',
      lesiones: [],
      traslado: '',
      paciente: { nombre: '', edad: '', sexo: '', telefono: '' },
      signos_vitales: { presion: '', pulso: '', respiracion: '', temperatura: '', saturacion: '' }
    });

    const mensaje = ref('');
    const tipoMensaje = ref('');
    const opcionesActivacion = ref(['Opción 1', 'Opción 2', 'Opción 3']); // Ejemplo de opciones

    const enviarRegistro = async () => {
      try {
        // Lógica para enviar el registro
        await registrosService.crearRegistro(formData.value);
        mensaje.value = 'Registro guardado exitosamente';
        tipoMensaje.value = 'alert-success';
      } catch (error) {
        mensaje.value = 'Error al guardar el registro';
        tipoMensaje.value = 'alert-error';
      }
    };

    // Debes RETORNAR todas las variables que uses en el template
    return {
      formData,
      mensaje,
      tipoMensaje,
      opcionesActivacion,
      enviarRegistro
    };
  }
}
</script>