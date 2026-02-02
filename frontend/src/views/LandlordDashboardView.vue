<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import api from '../api'
import PropertyCard from '../components/PropertyCard.vue' 
import { Chart, registerables } from 'chart.js'; 
Chart.register(...registerables); 

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const myProperties = ref([])
const myPropertiesBookings = ref([])
const monthlyRevenueData = ref({ labels: [], datasets: [] })
const loading = ref(true)
const error = ref(null)
const chartRef = ref(null)
let revenueChart = null

const stats = computed(() => {
  const totalRev = monthlyRevenueData.value.datasets[0]?.data.reduce((a, b) => a + b, 0) || 0
  const activeBookings = myPropertiesBookings.value.filter(b => b.status === 'confirmed').length
  const pendingBookings = myPropertiesBookings.value.filter(b => b.status === 'pending').length
  return { totalRev, activeBookings, pendingBookings }
})

onMounted(async () => {
  try {
    const [propsRes, bookingsRes, revRes] = await Promise.all([
      api.get('/properties/my_properties/'),
      api.get('/bookings/my_properties_bookings/'),
      api.get('/bookings/monthly_revenue/')
    ])
    
    myProperties.value = propsRes.data
    myPropertiesBookings.value = bookingsRes.data
    
    monthlyRevenueData.value = {
      labels: revRes.data.map(item => item.label),
      datasets: [{
        label: 'Revenue ($)',
        backgroundColor: '#6366f1',
        borderRadius: 12,
        data: revRes.data.map(item => item.revenue),
      }]
    }

    if (chartRef.value && monthlyRevenueData.value.labels.length > 0) {
      revenueChart = new Chart(chartRef.value, {
        type: 'bar',
        data: monthlyRevenueData.value,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
          }
        }
      })
    }
  } catch (err) {
    error.value = 'Failed to load dashboard data.'
  } finally {
    loading.value = false
  }
})

const downloadReport = async () => {
  try {
    const response = await api.get('/bookings/download_bookings_csv/', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'bookings_report.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    notificationStore.showNotification('Failed to download report.', 'error')
  }
}

const confirmBooking = async (id) => {
  try {
    await api.post(`/bookings/${id}/confirm/`)
    notificationStore.showNotification('Booking confirmed!', 'success')
    // Refresh local state
    const res = await api.get('/bookings/my_properties_bookings/')
    myPropertiesBookings.value = res.data
  } catch (err) {
    notificationStore.showNotification('Failed to confirm.', 'error')
  }
}

const cancelBooking = async (id) => {
  if (!confirm('Cancel this booking?')) return
  try {
    await api.post(`/bookings/${id}/cancel/`)
    notificationStore.showNotification('Booking cancelled.', 'success')
    const res = await api.get('/bookings/my_properties_bookings/')
    myPropertiesBookings.value = res.data
  } catch (err) {
    notificationStore.showNotification('Failed to cancel.', 'error')
  }
}

onBeforeUnmount(() => revenueChart?.destroy())
</script>

<template>
  <div class="space-y-10">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Landlord Dashboard</h1>
        <p class="text-slate-500 font-medium">Overview of your property performance and bookings.</p>
      </div>
      <router-link to="/landlord-dashboard/create-property" class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        New Property
      </router-link>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      <div v-for="i in 3" :key="i" class="h-32 bg-slate-100 rounded-[2rem]"></div>
    </div>

    <template v-else>
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Revenue</div>
          <div class="text-3xl font-black text-slate-900">${{ stats.totalRev.toLocaleString() }}</div>
        </div>
        <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Active Bookings</div>
          <div class="text-3xl font-black text-slate-900">{{ stats.activeBookings }}</div>
        </div>
        <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-indigo-600 bg-indigo-50/30 border-indigo-100">
          <div class="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-2">Pending Requests</div>
          <div class="text-3xl font-black">{{ stats.pendingBookings }}</div>
        </div>
      </div>

      <!-- Charts & Tables -->
      <div class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-bold text-slate-900">Revenue Overview</h2>
            <button @click="downloadReport" class="text-sm font-bold text-indigo-600 hover:text-indigo-700">Export CSV</button>
          </div>
          <div class="h-72">
            <canvas ref="chartRef"></canvas>
          </div>
        </div>

        <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
           <h2 class="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
           <div class="space-y-6">
              <div v-for="booking in myPropertiesBookings.slice(0, 4)" :key="booking.id" class="flex items-center gap-4">
                 <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                    {{ booking.tenant_details.username[0].toUpperCase() }}
                 </div>
                 <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-900 truncate">{{ booking.property_details.title }}</p>
                    <p class="text-xs text-slate-400">{{ booking.start_date }}</p>
                 </div>
                 <span :class="[
                   booking.status === 'confirmed' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50',
                   'px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider'
                 ]">{{ booking.status }}</span>
              </div>
           </div>
        </div>
      </div>

      <!-- Bookings Table -->
      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-slate-50 flex justify-between items-center">
          <h2 class="text-xl font-bold text-slate-900">Detailed Bookings</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50">
                <th class="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Property</th>
                <th class="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Guest</th>
                <th class="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Dates</th>
                <th class="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th class="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="booking in myPropertiesBookings" :key="booking.id" class="hover:bg-slate-50/30 transition-colors">
                <td class="px-8 py-5 text-sm font-bold text-slate-900">{{ booking.property_details.title }}</td>
                <td class="px-8 py-5 text-sm text-slate-600">{{ booking.tenant_details.username }}</td>
                <td class="px-8 py-5 text-sm text-slate-500 font-medium">{{ booking.start_date }} — {{ booking.end_date }}</td>
                <td class="px-8 py-5">
                  <span :class="[
                    booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                    booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600',
                    'px-3 py-1 rounded-full text-xs font-bold capitalize'
                  ]">{{ booking.status }}</span>
                </td>
                <td class="px-8 py-5 space-x-3">
                  <button v-if="booking.status === 'pending'" @click="confirmBooking(booking.id)" class="text-indigo-600 font-bold text-sm hover:underline">Confirm</button>
                  <button v-if="booking.status !== 'cancelled'" @click="cancelBooking(booking.id)" class="text-slate-400 font-bold text-sm hover:text-rose-600">Cancel</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
