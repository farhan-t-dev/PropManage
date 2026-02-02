<script setup>
import { useNotificationStore } from '../stores/notifications'
import { computed } from 'vue'

const notificationStore = useNotificationStore()

const notificationClass = computed(() => {
  switch (notificationStore.type) {
    case 'success':
      return 'bg-green-500'
    case 'error':
      return 'bg-red-500'
    case 'warning':
      return 'bg-yellow-500'
    case 'info':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform opacity-0 scale-95"
    enter-to-class="transform opacity-100 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform opacity-100 scale-100"
    leave-to-class="transform opacity-0 scale-95"
  >
    <div
      v-if="notificationStore.isVisible"
      :class="notificationClass"
      class="fixed bottom-5 right-5 p-4 rounded-md shadow-lg text-white max-w-sm z-50"
    >
      <div class="flex justify-between items-center">
        <span>{{ notificationStore.message }}</span>
        <button @click="notificationStore.hideNotification()" class="ml-4 text-white hover:text-gray-100 focus:outline-none">
          &times;
        </button>
      </div>
    </div>
  </Transition>
</template>
