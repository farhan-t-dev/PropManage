import { defineStore } from 'pinia'
import api from '../api'

export const usePropertyStore = defineStore('properties', {
  state: () => ({
    properties: [],
    currentProperty: null,
    loading: false,
    error: null,
    count: 0,
    next: null,
    previous: null,
  }),
  actions: {
    async fetchProperties(params = {}) {
      this.loading = true
      try {
        const response = await api.get('/properties/', { params })
        // DRF paginated response has 'results'
        this.properties = response.data.results || response.data
        this.count = response.data.count || this.properties.length
        this.next = response.data.next
        this.previous = response.data.previous
      } catch (err) {
        this.error = 'Failed to load properties'
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async fetchPropertyById(id) {
      this.loading = true
      try {
        const response = await api.get(`/properties/${id}/`)
        this.currentProperty = response.data
        return response.data
      } catch (err) {
        this.error = 'Failed to load property details'
        console.error(err)
        return null
      } finally {
        this.loading = false
      }
    }
  }
})
