import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'

// Importamos nuestros módulos principales
import RegistroPrehospitalario from '@/views/modules/RegistroPrehospitalario.vue'
import ConsultasView from '@/views/modules/ConsultasView.vue'
import EventosView from '@/views/modules/EventosView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  
  {
    path: '/',
    component: DashboardView,
    meta: { requiresAuth: true },
    children: [
      {
        path: '', // La raíz "/" mostrará los reportes
        name: 'Prehospitalario',
        component: RegistroPrehospitalario
      },
      {
        path: 'consultas', // La ruta "/consultas"
        name: 'Consultas',
        component: ConsultasView
      },
      {
        path: 'eventos', // La ruta "/eventos"
        name: 'Eventos',
        component: EventosView
      }
    ]
  },
  // Ruta separada para edición completa (fuera del Dashboard)
  {
    path: '/editar-registro/:id',
    name: 'EditarRegistro',
    component: () => import('@/views/modules/EditarRegistroView.vue'), // <-- CORREGIDO
    props: true,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// El guard de navegación se mantiene igual
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('user');
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router