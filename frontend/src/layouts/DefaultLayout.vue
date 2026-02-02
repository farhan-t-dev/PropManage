<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <router-link to="/" class="text-3xl font-bold text-gray-900">PropManage</router-link>
        <nav class="flex items-center space-x-4">
          <router-link to="/" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Home</router-link>
          <router-link to="/properties" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Properties</router-link>
          
          <template v-if="auth.isAuthenticated">
            <router-link to="/my-bookings" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">My Bookings</router-link>
            <router-link v-if="auth.isLandlord" to="/landlord-dashboard" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Landlord Dashboard</router-link>
            <span class="text-gray-400 text-sm italic">Hello, {{ auth.user?.username }}</span>
            <button @click="handleLogout" class="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium">Logout</button>
          </template>
          
          <template v-else>
            <router-link to="/login" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Login</router-link>
          </template>
        </nav>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-view />
      </div>
    </main>
  </div>
</template>
