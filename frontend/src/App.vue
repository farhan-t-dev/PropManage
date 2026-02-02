<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import NotificationToast from './components/NotificationToast.vue' // Import the NotificationToast component

const authStore = useAuthStore()

onMounted(() => {
  authStore.checkAuth()
})
</script>

<template>
  <router-view></router-view>
  <NotificationToast /> <!-- Add the NotificationToast component here -->
</template>