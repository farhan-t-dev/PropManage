import { defineStore } from 'pinia'
import axios from 'axios'

export const usePropertyStore = defineStore('properties', {
  state: () => ({
    properties: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchProperties() {
      this.loading = true
      try {
        const response = await axios.get('http://localhost:8000/api/properties/')
        this.properties = response.data
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
        const response = await axios.get(`http://localhost:8000/api/properties/${id}/`)
        return response.data
      } catch (err) {
        this.error = 'Failed to load property details'
        console.error(err)
      } finally {
        this.loading = false
      }
    }
  }
})
