<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import api from '../api'
import { Chart, registerables } from 'chart.js'; 
Chart.register(...registerables); 

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const bookings = ref([])
const units = ref([])
const maintenanceCount = ref(0)
const revenueData = ref([])
const loading = ref(true)
const chartRef = ref(null)
let revenueChart = null

const stats = computed(() => {
  const totalEarned = revenueData.value.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0)
  const occupancy = units.value.length > 0 
    ? Math.round((bookings.value.filter(b => b.status === 'confirmed').length / units.value.length) * 100) 
    : 0
  return { totalEarned, occupancy, pendingTickets: maintenanceCount.value }
})

onMounted(async () => {
  try {
    const [bookingsRes, unitsRes, revRes, maintRes] = await Promise.all([
      api.get('/bookings/my_properties_bookings/'),
      api.get('/units/'), // This should ideally be /units/my_units/
      api.get('/bookings/monthly_revenue/'),
      api.get('/maintenance/requests/')
    ])
    
    bookings.value = bookingsRes.data.results || bookingsRes.data
    units.value = unitsRes.data.results || unitsRes.data
    revenueData.value = revRes.data
    maintenanceCount.value = (maintRes.data.results || maintRes.data).filter(r => r.status !== 'resolved').length

    if (chartRef.value && revenueData.value.length > 0) {
      revenueChart = new Chart(chartRef.value, {
        type: 'line',
        data: {
          labels: revenueData.value.map(d => d.label),
          datasets: [{
            label: 'Monthly Earnings',
            data: revenueData.value.map(d => d.revenue),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { display: false }, border: { display: false } },
            x: { grid: { display: false }, border: { display: false } }
          }
        }
      })
    }
  } catch (err) {
    notificationStore.showNotification('Failed to load dashboard.', 'error')
  } finally {
    loading.value = false
  }
})

const confirmBooking = async (id) => {
  try {
    await api.post(`/bookings/${id}/confirm/`)
    notificationStore.showNotification('Booking confirmed!', 'success')
    const res = await api.get('/bookings/my_properties_bookings/')
    bookings.value = res.data.results || res.data
  } catch (err) {
    notificationStore.showNotification('Action failed.', 'error')
  }
}

onBeforeUnmount(() => revenueChart?.destroy())
</script>

<template>
  <div class="space-y-10">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">Executive Overview</h1>
        <p class="text-slate-500 font-medium">Business intelligence and operational metrics.</p>
      </div>
      <div class="flex gap-3">
        <router-link to="/landlord-dashboard/create-property" class="px-6 py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all">Add Property</router-link>
        <button class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Export Reports</button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Total Revenue (YTD)</div>
          <div class="text-3xl font-black text-slate-900 relative z-10">${{ stats.totalEarned.toLocaleString() }}</div>
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50"></div>
       </div>
       <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Portfolio Occupancy</div>
          <div class="text-3xl font-black text-slate-900 relative z-10">{{ stats.occupancy }}%</div>
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50"></div>
       </div>
       <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Pending Maintenance</div>
          <div class="text-3xl font-black text-rose-600 relative z-10">{{ stats.pendingTickets }}</div>
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-50 rounded-full opacity-50"></div>
       </div>
    </div>

    <!-- Analytics -->
    <div class="grid lg:grid-cols-3 gap-8">
       <div class="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 class="text-xl font-bold text-slate-900 mb-8">Revenue Momentum</h2>
          <div class="h-72">
             <canvas ref="chartRef"></canvas>
          </div>
       </div>
       
       <div class="bg-slate-900 p-10 rounded-[2.5rem] text-white">
          <h2 class="text-xl font-bold mb-6">Recent Units</h2>
          <div class="space-y-6">
             <div v-for="unit in units.slice(0, 3)" :key="unit.id" class="flex justify-between items-center">
                <div>
                   <div class="text-sm font-bold">{{ unit.title }}</div>
                   <div class="text-xs text-slate-400">{{ unit.unit_number }}</div>
                </div>
                <div class="text-right">
                   <div class="text-sm font-black">${{ unit.base_price }}</div>
                   <div class="text-[10px] text-emerald-400 font-bold">Active</div>
                </div>
             </div>
          </div>
          <router-link to="/discover" class="mt-10 block text-center py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all">View All Units</router-link>
       </div>
    </div>

    <!-- Active Bookings -->
    <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
       <div class="p-8 border-b border-slate-50">
          <h2 class="text-xl font-bold text-slate-900">Current Reservations</h2>
       </div>
       <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
             <thead class="bg-slate-50/50">
                <tr>
                   <th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit</th>
                   <th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest</th>
                   <th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                   <th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                   <th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
             </thead>
             <tbody class="divide-y divide-slate-50">
                <tr v-for="b in bookings" :key="b.id" class="hover:bg-slate-50/30 transition-all">
                   <td class="px-8 py-5">
                      <div class="text-sm font-bold text-slate-900">{{ b.unit_details.title }}</div>
                      <div class="text-[10px] text-slate-400 font-bold uppercase">{{ b.unit_details.unit_number }}</div>
                   </td>
                   <td class="px-8 py-5 text-sm text-slate-600 font-medium">{{ b.tenant_details.username }}</td>
                   <td class="px-8 py-5 text-sm font-black text-slate-900">${{ b.total_price }}</td>
                   <td class="px-8 py-5">
                      <span :class="[
                        b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
                        'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest'
                      ]">{{ b.status }}</span>
                   </td>
                   <td class="px-8 py-5 text-right">
                      <button v-if="b.status === 'pending'" @click="confirmBooking(b.id)" class="text-indigo-600 font-black text-xs uppercase hover:underline">Confirm</button>
                   </td>
                </tr>
             </tbody>
          </table>
       </div>
    </div>
  </div>
</template>
