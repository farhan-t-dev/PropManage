import { defineStore } from 'pinia'
import api from '../api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    isLandlord: (state) => state.user?.role === 'landlord',
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    async login(username, password) {
      try {
        // We use the api instance which has withCredentials: true
        await api.post('/auth/token/', {
          username,
          password,
        })
        
        await this.fetchUser()
        return true
      } catch (error) {
        console.error('Login failed', error)
        throw error
      }
    },

    async fetchUser() {
      try {
        const response = await api.get('/users/me/')
        this.user = response.data
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (error) {
        console.error('Failed to fetch user details', error)
        this.logout_local()
      }
    },

    async refreshAccessToken() {
      try {
        await api.post('/auth/token/refresh/')
      } catch (error) {
        this.logout_local()
        throw error
      }
    },

    async logout() {
      try {
        await api.post('/auth/logout/')
      } finally {
        this.logout_local()
      }
    },

    logout_local() {
      this.user = null
      localStorage.removeItem('user')
    },

    async checkAuth() {
      if (!this.user) {
        await this.fetchUser()
      }
    },
  },
})
