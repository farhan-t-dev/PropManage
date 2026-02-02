import { defineStore } from 'pinia'
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
        const response = await axios.post('http://localhost:8000/api/token/', {
          username,
          password,
        })
        
        this.accessToken = response.data.access
        this.refreshToken = response.data.refresh

        localStorage.setItem('accessToken', this.accessToken)
        localStorage.setItem('refreshToken', this.refreshToken)

        // Fetch user details including role
        await this.fetchUser()
        
        return true
      } catch (error) {
        console.error('Login failed', error)
        throw error
      }
    },

    async fetchUser() {
      if (!this.accessToken) {
        this.user = null;
        return;
      }
      try {
        const response = await axios.get('http://localhost:8000/api/users/me/', {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        })
        this.user = response.data
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (error) {
        console.error('Failed to fetch user details', error)
        this.logout() // Logout if fetching user fails (e.g., token expired or invalid)
      }
    },

    logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }, // Added comma here
    async checkAuth() {
      // Always attempt to fetch user if access token exists, to ensure role is up-to-date
      if (this.accessToken) {
        await this.fetchUser()
      } else {
        this.user = null; // Ensure user is null if no access token
      }
    },
  },
})
