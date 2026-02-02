import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    message: null,
    type: 'success', // 'success', 'error', 'warning', 'info'
    isVisible: false,
    timeoutId: null,
  }),
  actions: {
    showNotification(message, type = 'success', duration = 3000) {
      this.message = message
      this.type = type
      this.isVisible = true

      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
      }

      this.timeoutId = setTimeout(() => {
        this.hideNotification()
      }, duration)
    },
    hideNotification() {
      this.isVisible = false
      this.message = null
      this.type = 'success'
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
        this.timeoutId = null
      }
    },
  },
})