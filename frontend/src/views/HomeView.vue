<script setup>
import { useAuthStore } from '../stores/auth'
const auth = useAuthStore()
</script>

<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="bg-white shadow rounded-lg p-8 text-center">
      <h2 v-if="auth.isAuthenticated" class="text-3xl font-bold text-gray-900 mb-4">
        Welcome back, {{ auth.user?.username }}!
      </h2>
      <h2 v-else class="text-3xl font-bold text-gray-900 mb-4">
        Welcome to PropManage
      </h2>
      
      <p class="text-gray-600 max-w-2xl mx-auto mb-8">
        Your automated property management and booking solution. 
        Everything you need to manage properties, handle bookings, and generate invoices in one place.
      </p>

      <div v-if="!auth.isAuthenticated">
        <router-link to="/login" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Get Started by Logging In
        </router-link>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <router-link to="/properties" class="border border-gray-200 rounded-lg p-6 hover:border-indigo-500 transition-colors cursor-pointer text-left block">
          <h3 class="text-lg font-semibold mb-2">🏘️ View Properties</h3>
          <p class="text-sm text-gray-500">Browse and book available properties.</p>
        </router-link>
        <router-link to="/my-bookings" class="border border-gray-200 rounded-lg p-6 hover:border-indigo-500 transition-colors cursor-pointer text-left block">
          <h3 class="text-lg font-semibold mb-2">🗓️ My Bookings</h3>
          <p class="text-sm text-gray-500">Manage your existing reservations and status.</p>
        </router-link>
      </div>
    </div>
  </div>
</template>
