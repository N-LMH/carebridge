import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/app',
      name: 'app',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/admin/session/:id',
      name: 'admin-session',
      component: () => import('@/views/AdminSessionView.vue'),
      props: true,
      meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/doctor',
      name: 'doctor',
      component: () => import('@/views/DoctorView.vue'),
      meta: { requiresAuth: true, role: 'doctor' }
    },
    {
      path: '/doctor/session/:id',
      name: 'doctor-session',
      component: () => import('@/views/DoctorSessionView.vue'),
      props: true,
      meta: { requiresAuth: true, role: 'doctor' }
    },
    {
      path: '/session/:id',
      name: 'session',
      component: () => import('@/views/SessionView.vue'),
      props: true
    }
  ]
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  await auth.ensureInitialized()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.role && auth.user && auth.user.role !== to.meta.role) {
    return { name: 'landing' }
  }

  if (to.name === 'login' && auth.isAuthenticated && auth.user) {
    if (auth.user.role === 'doctor') return { name: 'doctor' }
    if (auth.user.role === 'admin') return { name: 'admin' }
  }
})

export default router
