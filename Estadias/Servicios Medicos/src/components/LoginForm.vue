<template>
  <div class="login-container">
    <div class="card">
      <div class="card-header bg-primary text-white">
        <h3 class="mb-0"> Iniciar Sesión </h3>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleLogin">
          <div v-if="message" :class="['alert', error ? 'alert-danger' : 'alert-success']">
            {{ message }}
          </div>
          
          <div class="mb-3">
            <label for="username" class="form-label">Usuario</label>
            <input
              type="text"
              class="form-control"
              v-model="user.username"
              required
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Contraseña</label>
            <input
              type="password"
              class="form-control"
              v-model="user.password"
              required
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <div class="d-grid">
            <button class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <span v-else>Iniciar Sesión</span>
            </button>
          </div>

          <div class="mt-3 text-center">
            <small class="text-muted">Credenciales: Danielo / asd123</small>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginForm',
  data() {
    return {
      user: {
        username: "",
        password: ""
      },
      loading: false,
      message: "",
      error: false
    };
  },
  created() {
    // Si ya está logueado, redirigir al dashboard
    if (this.$store.getters.isLoggedIn) {
      this.$router.push('/');
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.message = "";
      this.error = false;

      try {
        await this.$store.dispatch('login', this.user);
        this.$router.push('/');
      } catch (error) {
        this.loading = false;
        this.message = error.response?.data?.message || 'Error al iniciar sesión';
        this.error = true;
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 15px;
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
  text-align: center;
  padding: 20px;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>