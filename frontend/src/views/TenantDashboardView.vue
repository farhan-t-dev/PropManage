<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import api from '../api'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const bookings = ref([])
const maintenanceRequests = ref([])
const loading = ref(true)

const stats = computed(() => {
  const active = bookings.value.filter(b => b.status === 'confirmed').length
  const totalSpent = bookings.value.filter(b => b.invoice?.status === 'paid')
    .reduce((acc, curr) => acc + parseFloat(curr.total_price), 0)
  return { active, totalSpent }
})

const fetchData = async () => {
  try {
    const [bRes, mRes] = await Promise.all([
      api.get('/bookings/'),
      api.get('/maintenance/requests/')
    ])
    bookings.value = bRes.data.results || bRes.data
    maintenanceRequests.value = mRes.data.results || mRes.data
  } catch (err) {
    notificationStore.showNotification('Failed to load data.', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

const payInvoice = async (invoiceId) => {
  try {
    await api.post(`/billing/invoices/${invoiceId}/pay/`)
    notificationStore.showNotification('Payment successful!', 'success')
    fetchData()
  } catch (err) {
    notificationStore.showNotification('Payment failed.', 'error')
  }
}
</script>

<template>
  <div class="space-y-10">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">Resident Portal</h1>
        <p class="text-slate-500 font-medium">Welcome back, {{ authStore.user?.first_name }}.</p>
      </div>
      <router-link to="/discover" class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Book New Stay</router-link>
    </div>

    <!-- Tenant Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
       <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
             <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div>
             <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Stays</div>
             <div class="text-3xl font-black text-slate-900">{{ stats.active }}</div>
          </div>
       </div>
       <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div class="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
             <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1c-1.11 0-2.08-.402-2.599-1M12 8V7m0 11v1m0-1c1.11 0 2.08-.402 2.599-1M12 18V19m0-1c-1.11 0-2.08-.402-2.599-1M12 18V19" /></svg>
          </div>
          <div>
             <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Investment</div>
             <div class="text-3xl font-black text-slate-900">${{ stats.totalSpent.toLocaleString() }}</div>
          </div>
       </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-8">
       <!-- Active Reservations -->
       <div class="lg:col-span-2 space-y-6">
          <h2 class="text-xl font-bold text-slate-900 px-2">Active Reservations</h2>
          <div v-if="bookings.length === 0" class="bg-white p-10 rounded-[2.5rem] border border-slate-100 text-center text-slate-400">
             No bookings found. Start by exploring units.
          </div>
          <div v-else class="space-y-4">
             <div v-for="b in bookings" :key="b.id" class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div class="flex justify-between items-start mb-6">
                   <div>
                      <div class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{{ b.unit_details.property_title }}</div>
                      <h3 class="text-xl font-bold text-slate-900">{{ b.unit_details.title }}</h3>
                   </div>
                   <span :class="[
                     b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
                     'px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest'
                   ]">{{ b.status }}</span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-8">
                   <div class="p-4 bg-slate-50 rounded-2xl">
                      <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in</div>
                      <div class="text-sm font-bold text-slate-900">{{ b.start_date }}</div>
                   </div>
                   <div class="p-4 bg-slate-50 rounded-2xl">
                      <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-out</div>
                      <div class="text-sm font-bold text-slate-900">{{ b.end_date }}</div>
                   </div>
                </div>

                <div v-if="b.invoice" class="flex items-center justify-between pt-6 border-t border-slate-50">
                   <div>
                      <div class="text-xs font-bold text-slate-400 mb-1">Total Stay Value</div>
                      <div class="text-xl font-black text-slate-900">${{ b.total_price }}</div>
                   </div>
                   <div v-if="b.invoice.status === 'paid'" class="text-emerald-600 font-bold text-sm flex items-center gap-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                      Payment Verified
                   </div>
                   <button v-else-if="b.invoice.status === 'pending'" @click="payInvoice(b.invoice.id)" class="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all">Pay Invoice</button>
                </div>
             </div>
          </div>
       </div>

       <!-- Maintenance Summary -->
       <div class="space-y-6">
          <h2 class="text-xl font-bold text-slate-900 px-2">Maintenance Status</h2>
          <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
             <div v-if="maintenanceRequests.length === 0" class="text-center text-slate-400 text-sm py-4">No active requests.</div>
             <div v-for="req in maintenanceRequests.slice(0, 3)" :key="req.id" class="flex items-center gap-4">
                <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                </div>
                <div class="flex-1">
                   <div class="text-sm font-bold text-slate-900 line-clamp-1">{{ req.title }}</div>
                   <div class="text-[10px] font-black text-amber-600 uppercase tracking-widest">{{ req.status }}</div>
                </div>
             </div>
             <router-link to="/maintenance" class="block text-center py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-sm font-bold hover:bg-indigo-100 transition-all">Go to Tickets</router-link>
          </div>
       </div>
    </div>
  </div>
</template>
