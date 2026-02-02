<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import PropertyCard from '../components/PropertyCard.vue' // Assuming PropertyCard is reusable
import { Chart, registerables } from 'chart.js'; // Import Chart.js
Chart.register(...registerables); // Register all components from Chart.js

const authStore = useAuthStore()
const myProperties = ref([])
const myPropertiesBookings = ref([])
const monthlyRevenueData = ref({ labels: [], datasets: [] })
const loading = ref(true)
const error = ref(null)
const chartRef = ref(null) // Reference to the canvas element
let revenueChart = null // Store the Chart.js instance

onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.isLandlord) {
    error.value = 'You must be logged in as a landlord to view this page.'
    loading.value = false
    return
  }

  try {
    // Fetch landlord's properties
    const propertiesResponse = await axios.get('http://localhost:8000/api/properties/my_properties/', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    })
    myProperties.value = propertiesResponse.data

    // Fetch bookings for landlord's properties
    const bookingsResponse = await axios.get('http://localhost:8000/api/bookings/my_properties_bookings/', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    })
    myPropertiesBookings.value = bookingsResponse.data

    // Fetch monthly revenue data
    const revenueResponse = await axios.get('http://localhost:8000/api/bookings/monthly_revenue/', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    })
    
    // Prepare data for Chart.js
    monthlyRevenueData.value.labels = revenueResponse.data.map(item => item.label)
    monthlyRevenueData.value.datasets = [{
      label: 'Monthly Revenue',
      backgroundColor: '#4f46e5', // Indigo-600
      borderColor: '#4f46e5',
      data: revenueResponse.data.map(item => item.revenue),
    }];

    // Initialize chart after data is fetched and DOM is ready
    if (chartRef.value) {
        revenueChart = new Chart(chartRef.value, {
            type: 'bar', // Bar chart for monthly revenue
            data: monthlyRevenueData.value,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue ($)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                }
            }
        });
    }

  } catch (err) {
    console.error('Error fetching landlord data:', err)
    error.value = 'Failed to load landlord dashboard data. Please try again.'
  } finally {
    loading.value = false
  }
})

const downloadReport = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/bookings/download_bookings_csv/', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      },
      responseType: 'blob', // Important for handling binary data
    })
    
    // Create a link to download the file
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'bookings_report.csv') // Filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    console.error('Error downloading report:', err)
    // You might want to use your notification store here
    alert('Failed to download report.') 
  }
}

onBeforeUnmount(() => {
    if (revenueChart) {
        revenueChart.destroy(); // Clean up chart instance
    }
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <router-view></router-view> <!-- For nested routes like CreateProperty -->

    <div v-if="$route.name === 'landlord-dashboard'"> <!-- Only show dashboard content if not on a child route -->
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900">Landlord Dashboard</h1>
        <p class="mt-2 text-sm text-gray-700">Manage your properties and view associated bookings.</p>
      </div>

      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
        <p class="text-red-700">{{ error }}</p>
      </div>

      <div v-else>
        <!-- Monthly Revenue Chart -->
        <div class="mt-8 mb-12">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-900">Monthly Revenue</h2>
                <button @click="downloadReport" class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Download Report (CSV)
                </button>
            </div>
            <div v-if="monthlyRevenueData.labels.length > 0" class="relative h-80">
                <canvas ref="chartRef"></canvas>
            </div>
            <div v-else class="text-center py-6 text-gray-500">
                No revenue data available yet.
            </div>
        </div>

        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-900">Your Properties</h2>
          <router-link to="/landlord-dashboard/create-property" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Add New Property
          </router-link>
        </div>
        <div v-if="myProperties.length === 0" class="text-center py-6">
          <p class="text-gray-500 text-lg">You have not listed any properties yet.</p>
          <p class="mt-2 text-gray-500">Click "Add New Property" to get started.</p>
        </div>
        <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PropertyCard 
            v-for="property in myProperties" 
            :key="property.id" 
            :property="property" 
          />
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-4">Bookings for Your Properties</h2>
        <div v-if="myPropertiesBookings.length === 0" class="text-center py-6 text-gray-500">
          No bookings found for your properties.
        </div>
        <div v-else class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Property</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tenant</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-sm text-gray-900">Start Date</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">End Date</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Invoice Status</th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="booking in myPropertiesBookings" :key="booking.id">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ booking.property_details.title }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ booking.tenant_details.username }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ booking.start_date }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ booking.end_date }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                   <span v-if="booking.invoice"
                    :class="{
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                      'bg-yellow-100 text-yellow-800': booking.invoice.status === 'pending',
                      'bg-green-100 text-green-800': booking.invoice.status === 'paid',
                      'bg-red-100 text-red-800': booking.invoice.status === 'overdue' || booking.invoice.status === 'cancelled',
                    }"
                  >
                    {{ booking.invoice.status.charAt(0).toUpperCase() + booking.invoice.status.slice(1) }}
                  </span>
                  <span v-else>N/A</span>
                </td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <!-- TODO: Add actions like confirm/cancel booking -->
                  <a href="#" class="text-indigo-600 hover:text-indigo-900">View<span class="sr-only">, {{ booking.property_details.title }}</span></a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
