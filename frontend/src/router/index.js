import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import PropertiesView from '../views/PropertiesView.vue'
import PropertyDetailView from '../views/PropertyDetailView.vue'
import { useAuthStore } from '../stores/auth' // Import auth store

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView
        },
        {
          path: 'login',
          name: 'login',
          component: LoginView,
          meta: { requiresGuest: true } // Only accessible by guests (not logged in)
        },
        {
          path: 'discover',
          name: 'discover',
          component: () => import('../views/PropertiesView.vue')
        },
        {
          path: 'unit/:id',
          name: 'unit-detail',
          component: () => import('../views/PropertyDetailView.vue')
        },
        {
          path: 'maintenance',
          name: 'maintenance',
          component: () => import('../views/MaintenanceView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'my-bookings',
          name: 'tenant-dashboard',
          component: () => import('../views/TenantDashboardView.vue'),
          meta: { requiresAuth: true, requiresRole: ['tenant'] } // Only for authenticated tenants
        },
        {
          path: 'landlord-dashboard',
          name: 'landlord-dashboard',
          component: () => import('../views/LandlordDashboardView.vue'),
          meta: { requiresAuth: true, requiresRole: ['landlord'] }, // Only for authenticated landlords
          children: [
            {
              path: 'create-property',
              name: 'create-property',
              component: () => import('../views/CreatePropertyView.vue'),
              meta: { requiresAuth: true, requiresRole: ['landlord'] }
            }
          ]
        },
        {
          path: '/:catchAll(.*)', // Catch-all route for 404s
          name: 'NotFound',
          component: () => import('../views/NotFoundView.vue') // You'll need to create this
        }
      ]
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  await authStore.checkAuth() // Ensure user data is loaded

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const requiredRoles = to.matched.reduce((roles, record) => {
    if (record.meta.requiresRole) {
      roles.push(...record.meta.requiresRole)
    }
    return roles
  }, [])

  if (requiresAuth && !authStore.isAuthenticated) {
    // If route requires auth and user is not authenticated, redirect to login
    next({ name: 'login' })
  } else if (requiresGuest && authStore.isAuthenticated) {
    // If route requires guest and user is authenticated, redirect to home
    next({ name: 'home' })
  } else if (requiredRoles.length > 0 && !requiredRoles.includes(authStore.user?.role)) {
    // If route requires specific role(s) and user doesn't have it, redirect to home
    next({ name: 'home' }) // Or a specific unauthorized page
  } else {
    next() // Proceed to route
  }
})

export default router
