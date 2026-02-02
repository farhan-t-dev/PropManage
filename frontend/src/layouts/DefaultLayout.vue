<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const isSidebarOpen = ref(false)

function handleLogout() {
  auth.logout()
  router.push('/login')
}

const navigation = [
  { name: 'Discover', href: '/properties', icon: 'search' },
  { name: 'My Bookings', href: '/my-bookings', icon: 'calendar', role: 'tenant' },
  { name: 'Landlord Dashboard', href: '/landlord-dashboard', icon: 'layout', role: 'landlord' },
]

function isActive(path) {
  return route.path === path
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Top Navigation -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <button @click="isSidebarOpen = !isSidebarOpen" class="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          <router-link to="/" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <span class="text-xl font-bold text-slate-900 tracking-tight">PropManage</span>
          </router-link>
        </div>

        <div class="flex items-center gap-4">
          <template v-if="auth.isAuthenticated">
            <div class="hidden sm:flex flex-col items-end mr-2">
              <span class="text-sm font-semibold text-slate-900">{{ auth.user?.first_name }} {{ auth.user?.last_name }}</span>
              <span class="text-xs text-slate-500 capitalize">{{ auth.user?.role }}</span>
            </div>
            <button @click="handleLogout" class="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              Logout
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              Sign In
            </router-link>
            <router-link to="/register" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-shadow shadow-sm">
              Get Started
            </router-link>
          </template>
        </div>
      </div>
    </header>

    <div class="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
      <!-- Sidebar Navigation (Desktop) -->
      <aside class="hidden lg:block w-64 flex-shrink-0">
        <nav class="space-y-1 sticky top-24">
          <router-link 
            v-for="item in navigation.filter(n => !n.role || (auth.isAuthenticated && auth.user?.role === n.role))" 
            :key="item.name"
            :to="item.href"
            :class="[
              isActive(item.href) 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all'
            ]"
          >
            <span class="mr-3">
               <!-- Simple Icon Placeholders -->
               <svg v-if="item.icon === 'search'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
               <svg v-if="item.icon === 'calendar'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
               <svg v-if="item.icon === 'layout'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            </span>
            {{ item.name }}
          </router-link>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 min-w-0">
        <router-view v-slot="{ Component }">
          <transition 
            enter-active-class="transition ease-out duration-200" 
            enter-from-class="opacity-0 translate-y-4" 
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-4"
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-slate-900/50 z-50 lg:hidden"></div>
    <div 
      :class="[
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden transition-transform duration-300 ease-in-out p-6'
      ]"
    >
      <div class="flex items-center justify-between mb-8">
        <span class="text-xl font-bold text-slate-900">Menu</span>
        <button @click="isSidebarOpen = false" class="p-2 text-slate-500">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
        </button>
      </div>
       <nav class="space-y-2">
          <router-link 
            v-for="item in navigation.filter(n => !n.role || (auth.isAuthenticated && auth.user?.role === n.role))" 
            :key="item.name"
            :to="item.href"
            @click="isSidebarOpen = false"
            :class="[
              isActive(item.href) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600',
              'flex items-center px-4 py-3 text-base font-medium rounded-xl'
            ]"
          >
            {{ item.name }}
          </router-link>
        </nav>
    </div>
  </div>
</template>

<style scoped>
.router-link-active {
  @apply bg-indigo-50 text-indigo-700;
}
</style>
