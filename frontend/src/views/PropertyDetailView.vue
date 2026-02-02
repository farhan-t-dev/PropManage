<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePropertyStore } from '../stores/properties'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications' // Import notification store
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const propertyStore = usePropertyStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore() // Initialize notification store

const property = ref(null)
const startDate = ref('')
const endDate = ref('')
const isAvailable = ref(null)
const checkingAvailability = ref(false)
// const bookingError = ref('') // Removed
// const bookingSuccess = ref(false) // Removed

onMounted(async () => {
  const id = route.params.id
  property.value = await propertyStore.fetchPropertyById(id)
})

const checkAvailability = async () => {
  if (!startDate.value || !endDate.value) return

  checkingAvailability.value = true
  isAvailable.value = null
  // bookingError.value = '' // Removed
  
  try {
    const response = await axios.get(`http://localhost:8000/api/properties/${property.value.id}/check_availability/`, {
      params: {
        start_date: startDate.value,
        end_date: endDate.value
      }
    })
    isAvailable.value = response.data.available
  } catch (err) {
    console.error('Error checking availability', err)
    notificationStore.showNotification('Error checking availability.', 'error')
  } finally {
    checkingAvailability.value = false
  }
}

// Watch for date changes to trigger availability check
watch([startDate, endDate], () => {
  if (startDate.value && endDate.value) {
    checkAvailability()
  }
})

const handleBook = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    notificationStore.showNotification('Please log in to make a booking.', 'info')
    return
  }

  try {
    const response = await axios.post('http://localhost:8000/api/bookings/', {
      property: property.value.id,
      start_date: startDate.value,
      end_date: endDate.value
    }, {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    })
    // bookingSuccess.value = true // Removed
    // bookingError.value = '' // Removed
    notificationStore.showNotification('Booking successful! Your reservation is pending.', 'success')
  } catch (err) {
    const errorMessage = err.response?.data?.non_field_errors?.[0] || 'Booking failed. Please try again.'
    // bookingError.value = errorMessage // Removed
    notificationStore.showNotification(errorMessage, 'error')
  }
}
</script>

<template>
  <div v-if="property" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
      <!-- Left: Property Details -->
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">{{ property.title }}</h1>
        <div class="mt-3">
          <p class="text-3xl text-gray-900">${{ property.base_price }} / night</p>
        </div>

        <div class="mt-6">
          <h3 class="sr-only">Description</h3>
          <div class="text-base text-gray-700 space-y-6">
            <p>{{ property.description }}</p>
          </div>
        </div>

        <div class="mt-8">
          <h3 class="text-sm font-medium text-gray-900">Address</h3>
          <p class="mt-2 text-sm text-gray-500">{{ property.address }}</p>
        </div>

        <div class="mt-8 border-t border-gray-200 pt-8">
          <h3 class="text-sm font-medium text-gray-900">Features</h3>
          <div class="mt-4">
            <ul role="list" class="pl-4 list-disc text-sm space-y-2 text-gray-500">
              <li v-for="(val, key) in property.features" :key="key">
                <span class="capitalize font-medium text-gray-700">{{ key }}:</span> {{ val ? 'Yes' : 'No' }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Right: Booking Form -->
      <div class="mt-10 lg:mt-0 bg-white shadow sm:rounded-lg border border-gray-200 p-6 sticky top-8">
        <h2 class="text-lg font-medium text-gray-900 mb-6">Reserve this property</h2>
        
        <!-- Removed v-if="bookingSuccess" div -->

        <form @submit.prevent="handleBook" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="start_date" class="block text-sm font-medium text-gray-700">Check-in</label>
              <input v-model="startDate" type="date" id="start_date" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div>
              <label for="end_date" class="block text-sm font-medium text-gray-700">Check-out</label>
              <input v-model="endDate" type="date" id="end_date" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
          </div>

          <!-- Availability Feedback -->
          <div v-if="startDate && endDate" class="mt-4">
            <div v-if="checkingAvailability" class="text-sm text-gray-500 animate-pulse">Checking availability...</div>
            <div v-else-if="isAvailable === true" class="text-sm text-green-600 font-medium">✓ Available for these dates!</div>
            <div v-else-if="isAvailable === false" class="text-sm text-red-600 font-medium">✗ Already booked for these dates.</div>
          </div>

          <!-- Removed v-if="bookingError" div -->

          <button 
            type="submit"
            :disabled="!isAvailable || checkingAvailability || (authStore.isAuthenticated && notificationStore.type === 'success')"
            class="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {{ authStore.isAuthenticated ? (notificationStore.type === 'success' ? 'Booked' : 'Reserve Now') : 'Login to Book' }}
          </button>
          
          <p class="text-center text-xs text-gray-500 mt-4">You won't be charged yet.</p>
        </form>
      </div>
    </div>
  </div>
  <div v-else-if="propertyStore.loading" class="flex justify-center py-20">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
</template>
