import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/Landing.vue'),
    meta: { requiresAuth: false, publicOnly: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/Signup.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPassword.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../views/ResetPassword.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/auth-callback',
    name: 'AuthCallback',
    component: () => import('../views/AuthCallback.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/installations',
    name: 'Installations',
    component: () => import('../views/Installations.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/installations/:id',
    name: 'InstallationDetail',
    component: () => import('../views/InstallationDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/monitoring',
    name: 'Monitoring',
    component: () => import('../views/Monitoring.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/marketplace',
    name: 'Marketplace',
    component: () => import('../views/Marketplace.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/assessment',
    name: 'Assessment',
    component: () => import('../views/Assessment.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contracts',
    name: 'Contracts',
    component: () => import('../views/Contracts.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { requiresAuth: false }
  },
  // ── Persona Routes ─────────────────────────────────────────────
  {
    path: '/dealer',
    name: 'DealerPortal',
    component: () => import('../views/DealerPortal.vue'),
    meta: { requiresAuth: true, allowedRoles: ['dealer', 'installer', 'admin', 'superadmin'] }
  },
  {
    path: '/operations',
    name: 'OperationsCenter',
    component: () => import('../views/OperationsCenter.vue'),
    meta: { requiresAuth: true, allowedRoles: ['operations', 'admin', 'superadmin'] }
  },
  {
    path: '/admin',
    name: 'AdminConsole',
    component: () => import('../views/AdminConsole.vue'),
    meta: { requiresAuth: true, allowedRoles: ['admin', 'superadmin'] }
  },
  {
    path: '/superadmin',
    name: 'SuperAdminConsole',
    component: () => import('../views/SuperAdminConsole.vue'),
    meta: { requiresAuth: true, allowedRoles: ['superadmin'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication & role-based access
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.publicOnly && userStore.isAuthenticated) {
    // Authenticated users landing on public-only pages go to solar assessment
    next('/assessment')
  } else if ((to.name === 'Login' || to.name === 'Signup') && userStore.isAuthenticated) {
    next('/assessment')
  } else if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(userStore.userRole)) {
    // Role-based guard: redirect to dashboard if user lacks permission
    next('/dashboard')
  } else {
    next()
  }
})

export default router
