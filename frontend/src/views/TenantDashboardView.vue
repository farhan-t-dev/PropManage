<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications' // Added
import axios from 'axios'

const authStore = useAuthStore()
const notificationStore = useNotificationStore() // Added
const bookings = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    // This is also handled by router.beforeEach (if implemented)
    // but good to have a fallback
    error.value = 'Please log in to view your bookings.'
    loading.value = false
    return
  }

  try {
    const response = await axios.get('http://localhost:8000/api/bookings/', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    })
    bookings.value = response.data
  } catch (err) {
    console.error('Error fetching bookings:', err)
    error.value = 'Failed to load bookings. Please try again.'
      } finally {
      loading.value = false
    }
  })
  
  const payInvoice = async (invoiceId) => {
    try {
      await axios.post(`http://localhost:8000/api/billing/invoices/${invoiceId}/pay/`, {}, {
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`
        }
      })
      notificationStore.showNotification('Invoice paid successfully!', 'success')
      // Refresh bookings to show updated invoice status
      const response = await axios.get('http://localhost:8000/api/bookings/', {
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`
        }
      })
      bookings.value = response.data
    } catch (err) {
      console.error('Error paying invoice:', err)
      notificationStore.showNotification('Failed to pay invoice.', 'error')
    }
  }  </script>
<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-gray-900">Tenant Dashboard</h1>
      <p class="mt-2 text-sm text-gray-700">Your personalized overview of bookings and activities.</p>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
      <p class="text-red-700">{{ error }}</p>
    </div>

    <div v-else-if="bookings.length === 0" class="text-center py-12">
      <p class="text-gray-500 text-lg">You have no bookings yet.</p>
      <router-link to="/properties" class="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
        Browse Properties
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="booking in bookings" :key="booking.id" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            {{ booking.property_details.title }}
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            {{ booking.property_details.address }}
          </p>
          <div class="mt-4 border-t border-gray-200 pt-4">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Check-in</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ booking.start_date }}</dd>
              </div>
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Check-out</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ booking.end_date }}</dd>
              </div>
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Status</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <span 
                    :class="{
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                      'bg-yellow-100 text-yellow-800': booking.status === 'pending',
                      'bg-green-100 text-green-800': booking.status === 'confirmed',
                      'bg-red-100 text-red-800': booking.status === 'cancelled',
                    }"
                  >
                    {{ booking.status.charAt(0).toUpperCase() + booking.status.slice(1) }}
                  </span>
                </dd>
              </div>
              <div class="sm:col-span-1" v-if="booking.invoice">
                <dt class="text-sm font-medium text-gray-500">Invoice Status</dt>
                <dd class="mt-1 text-sm text-gray-900">
                   <span 
                    :class="{
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                      'bg-yellow-100 text-yellow-800': booking.invoice.status === 'pending',
                      'bg-green-100 text-green-800': booking.invoice.status === 'paid',
                      'bg-red-100 text-red-800': booking.invoice.status === 'overdue' || booking.invoice.status === 'cancelled',
                    }"
                  >
                    {{ booking.invoice.status.charAt(0).toUpperCase() + booking.invoice.status.slice(1) }}
                  </span>
                  <button 
                    v-if="booking.invoice.status === 'pending'"
                    @click="payInvoice(booking.invoice.id)"
                    class="ml-2 text-indigo-600 hover:text-indigo-900 font-semibold"
                  >
                    Pay Now
                  </button>
                  <div class="text-xs text-gray-400 mt-1">(Due: {{ booking.invoice.due_date }})</div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
