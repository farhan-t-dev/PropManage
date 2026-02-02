<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import api from '../api'
import AvailabilityCalendar from '../components/AvailabilityCalendar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const unit = ref(null)
const bookedDates = ref([])
const startDate = ref('')
const endDate = ref('')
const isAvailable = ref(null)
const checkingAvailability = ref(false)

onMounted(async () => {
  try {
    const id = route.params.id
    const response = await api.get(`/units/${id}/`)
    unit.value = response.data
    
    // Fetch bookings for the calendar
    const bookingsRes = await api.get('/bookings/', { params: { unit: id } })
    bookedDates.value = bookingsRes.data.results || bookingsRes.data
  } catch (err) {
    notificationStore.showNotification('Failed to load unit details.', 'error')
    router.push('/discover')
  }
})

const checkAvailability = async () => {
  if (!startDate.value || !endDate.value) return
  checkingAvailability.value = true
  isAvailable.value = null
  
  try {
    const response = await api.get(`/units/${unit.value.id}/check_availability/`, {
      params: { start_date: startDate.value, end_date: endDate.value }
    })
    isAvailable.value = response.data.available
  } catch (err) {
    notificationStore.showNotification('Error checking availability.', 'error')
  } finally {
    checkingAvailability.value = false
  }
}

watch([startDate, endDate], () => {
  if (startDate.value && endDate.value) checkAvailability()
})

const totalPrice = computed(() => {
  if (!startDate.value || !endDate.value || !unit.value) return 0
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  
  if (days <= 0) return 0
  
  let price = unit.value.base_price * days
  // Peak Season (June-August) simulation
  if (start.getMonth() >= 5 && start.getMonth() <= 7) {
    price *= 1.20
  }
  return price
})

const handleBook = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  try {
    await api.post('/bookings/', {
      unit: unit.value.id,
      start_date: startDate.value,
      end_date: endDate.value
    })
    notificationStore.showNotification('Reservation request sent successfully!', 'success')
    router.push('/my-bookings')
  } catch (err) {
    const msg = err.response?.data?.non_field_errors?.[0] || 'Booking failed.'
    notificationStore.showNotification(msg, 'error')
  }
}
</script>

<template>
  <div v-if="unit" class="space-y-12 pb-20">
    <nav class="flex items-center text-sm font-medium text-slate-500">
      <router-link to="/discover" class="hover:text-indigo-600 transition-colors">Discover</router-link>
      <svg class="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
      <span class="text-slate-900 truncate">{{ unit.property_title }}</span>
    </nav>

    <div class="grid lg:grid-cols-3 gap-12">
      <div class="lg:col-span-2 space-y-10">
        <div>
          <span class="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-2 block">{{ unit.property_title }}</span>
          <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">{{ unit.title }} ({{ unit.unit_number }})</h1>
        </div>

        <div class="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden relative border border-slate-200">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5"></div>
          <div class="absolute inset-0 flex items-center justify-center text-slate-200">
             <svg class="w-24 h-24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </div>
        </div>

        <div class="prose prose-slate max-w-none">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">Space Overview</h2>
          <p class="text-slate-600 leading-relaxed text-lg">{{ unit.description }}</p>
        </div>

        <div class="pt-8 border-t border-slate-100">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Amenities & Features</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div v-for="(val, key) in unit.features" :key="key" class="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div class="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-indigo-600 font-bold">✓</div>
              <span class="text-sm font-bold text-slate-700 capitalize">{{ key }}</span>
            </div>
          </div>
        </div>
      </div>

      <aside>
        <AvailabilityCalendar :bookedDates="bookedDates" class="mb-8" />
        <div class="sticky top-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-100/50 p-8">
          <div class="mb-8">
            <div class="text-3xl font-black text-slate-900">${{ unit.base_price }}<span class="text-sm text-slate-400 font-medium"> / night</span></div>
            <div class="text-xs text-indigo-500 font-bold mt-1 uppercase tracking-wider">Dynamic Pricing Enabled</div>
          </div>

          <form @submit.prevent="handleBook" class="space-y-6">
            <div class="space-y-4">
              <div class="relative">
                <label class="absolute -top-2.5 left-4 px-2 bg-white text-[10px] font-black uppercase tracking-widest text-slate-400">Check-in</label>
                <input v-model="startDate" type="date" class="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900">
              </div>
              <div class="relative">
                <label class="absolute -top-2.5 left-4 px-2 bg-white text-[10px] font-black uppercase tracking-widest text-slate-400">Check-out</label>
                <input v-model="endDate" type="date" class="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900">
              </div>
            </div>

            <div v-if="startDate && endDate" class="bg-indigo-50/50 p-4 rounded-2xl space-y-2">
               <div v-if="checkingAvailability" class="flex items-center text-sm text-indigo-600 font-bold">Checking availability...</div>
               <div v-else-if="isAvailable === true" class="flex items-center text-sm text-emerald-600 font-bold">✓ Unit is available</div>
               <div v-else-if="isAvailable === false" class="flex items-center text-sm text-rose-600 font-bold">✗ Fully booked / Maintenance</div>
            </div>

            <div v-if="totalPrice > 0" class="pt-4 border-t border-slate-100 space-y-3">
               <div class="flex justify-between text-sm text-slate-500 font-medium">
                 <span>Stay Duration</span>
                 <span>{{ Math.ceil((new Date(endDate) - new Date(startDate)) / (1000*60*60*24)) }} nights</span>
               </div>
               <div class="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-slate-50">
                 <span>Est. Total</span>
                 <span>${{ totalPrice }}</span>
               </div>
            </div>

            <button 
              type="submit"
              :disabled="!isAvailable || checkingAvailability"
              class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-indigo-600 disabled:bg-slate-200 transition-all"
            >
              {{ authStore.isAuthenticated ? 'Reserve Now' : 'Login to Book' }}
            </button>
          </form>
        </div>
      </aside>
    </div>
  </div>
  <div v-else class="animate-pulse space-y-12">
    <div class="h-10 bg-slate-100 w-1/3 rounded-xl"></div>
    <div class="grid lg:grid-cols-3 gap-12">
      <div class="lg:col-span-2 h-96 bg-slate-100 rounded-[2.5rem]"></div>
      <div class="h-96 bg-slate-100 rounded-[2.5rem]"></div>
    </div>
  </div>
</template>
