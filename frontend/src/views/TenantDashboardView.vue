<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import api from '../api'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const bookings = ref([])
const loading = ref(true)
const error = ref(null)

const fetchBookings = async () => {
  try {
    const response = await api.get('/bookings/')
    bookings.value = response.data.results || response.data
  } catch (err) {
    error.value = 'Failed to load your bookings.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchBookings)

const payInvoice = async (invoiceId) => {
  try {
    await api.post(`/billing/invoices/${invoiceId}/pay/`)
    notificationStore.showNotification('Payment successful!', 'success')
    fetchBookings()
  } catch (err) {
    notificationStore.showNotification('Payment failed.', 'error')
  }
}
</script>

<template>
  <div class="space-y-10">
    <div class="max-w-2xl">
      <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">My Bookings</h1>
      <p class="text-slate-500 font-medium">Manage your reservations, view invoices, and track your stays.</p>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      <div v-for="i in 2" :key="i" class="h-64 bg-slate-100 rounded-[2.5rem]"></div>
    </div>

    <div v-else-if="bookings.length === 0" class="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
       <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
       </div>
       <h3 class="text-xl font-bold text-slate-900 mb-2">No bookings yet</h3>
       <p class="text-slate-500 mb-8">Ready to find your next adventure?</p>
       <router-link to="/properties" class="inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
         Browse Properties
       </router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div v-for="booking in bookings" :key="booking.id" class="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden">
        <div class="p-8">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{{ booking.property_details.title }}</h3>
              <p class="text-sm text-slate-400 font-medium mt-1">{{ booking.property_details.address }}</p>
            </div>
            <span :class="[
              booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
              booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600',
              'px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest'
            ]">{{ booking.status }}</span>
          </div>

          <div class="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl mb-8">
            <div>
              <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in</div>
              <div class="text-sm font-bold text-slate-900">{{ booking.start_date }}</div>
            </div>
            <div>
              <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-out</div>
              <div class="text-sm font-bold text-slate-900">{{ booking.end_date }}</div>
            </div>
          </div>

          <div v-if="booking.invoice" class="flex items-center justify-between pt-6 border-t border-slate-50">
            <div>
              <div class="text-xs font-bold text-slate-400 mb-1">Invoice Amount</div>
              <div class="text-lg font-black text-slate-900">${{ booking.invoice.amount }}</div>
            </div>
            
            <div class="flex items-center gap-4">
              <span v-if="booking.invoice.status === 'paid'" class="flex items-center text-emerald-600 font-bold text-sm">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                Paid
              </span>
              <button 
                v-else-if="booking.invoice.status === 'pending'"
                @click="payInvoice(booking.invoice.id)"
                class="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-all"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
