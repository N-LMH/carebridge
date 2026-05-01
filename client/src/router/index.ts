import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue')
    },
    {
      path: '/app',
      name: 'app',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue')
    },
    {
      path: '/admin/session/:id',
      name: 'admin-session',
      component: () => import('@/views/AdminSessionView.vue'),
      props: true
    },
    {
      path: '/session/:id',
      name: 'session',
      component: () => import('@/views/SessionView.vue'),
      props: true
    }
  ]
})

export default router
