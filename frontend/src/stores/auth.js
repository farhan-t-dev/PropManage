import { defineStore } from 'pinia'
import api from '../api'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isLandlord: (state) => state.user?.role === 'landlord',
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    async login(username, password) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/token/`, {
          username,
          password,
        })
        
        this.accessToken = response.data.access
        this.refreshToken = response.data.refresh

        localStorage.setItem('accessToken', this.accessToken)
        localStorage.setItem('refreshToken', this.refreshToken)

        await this.fetchUser()
        return true
      } catch (error) {
        console.error('Login failed', error)
        throw error
      }
    },

    async fetchUser() {
      if (!this.accessToken) return
      try {
        const response = await api.get('/users/me/')
        this.user = response.data
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (error) {
        console.error('Failed to fetch user details', error)
        this.logout()
      }
    },

    async refreshAccessToken() {
      if (!this.refreshToken) throw new Error('No refresh token')
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/token/refresh/`, {
          refresh: this.refreshToken
        })
        this.accessToken = response.data.access
        localStorage.setItem('accessToken', this.accessToken)
      } catch (error) {
        this.logout()
        throw error
      }
    },

    logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    },

    async checkAuth() {
      if (this.accessToken && !this.user) {
        await this.fetchUser()
      }
    },
  },
})
