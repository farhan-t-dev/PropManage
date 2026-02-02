<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePropertyStore } from '../stores/properties'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import api from '../api'

const route = useRoute()
const router = useRouter()
const propertyStore = usePropertyStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const property = ref(null)
const startDate = ref('')
const endDate = ref('')
const isAvailable = ref(null)
const checkingAvailability = ref(false)

onMounted(async () => {
  const id = route.params.id
  property.value = await propertyStore.fetchPropertyById(id)
})

const checkAvailability = async () => {
  if (!startDate.value || !endDate.value) return
  checkingAvailability.value = true
  isAvailable.value = null
  
  try {
    const response = await api.get(`/properties/${property.value.id}/check_availability/`, {
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
  if (!startDate.value || !endDate.value || !property.value) return 0
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  return days > 0 ? days * property.value.base_price : 0
})

const handleBook = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  try {
    await api.post('/bookings/', {
      property: property.value.id,
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
  <div v-if="property" class="space-y-12 pb-20">
    <!-- Breadcrumbs/Back -->
    <button @click="router.back()" class="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      Back to Discover
    </button>

    <div class="grid lg:grid-cols-3 gap-12">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-10">
        <!-- Title & Header -->
        <div>
          <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">{{ property.title }}</h1>
          <div class="flex items-center text-slate-500">
            <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {{ property.address }}
          </div>
        </div>

        <!-- Hero Gallery Placeholder -->
        <div class="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden relative group">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10"></div>
          <div class="absolute inset-0 flex items-center justify-center">
             <svg class="w-20 h-20 text-slate-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </div>
        </div>

        <!-- Description -->
        <div class="prose prose-slate max-w-none">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">About this space</h2>
          <p class="text-slate-600 leading-relaxed text-lg">
            {{ property.description }}
          </p>
        </div>

        <!-- Amenities -->
        <div class="pt-8 border-t border-slate-100">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">What this place offers</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div v-for="(val, key) in property.features" :key="key" class="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
              <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                <svg v-if="key === 'wifi'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span class="text-sm font-semibold text-slate-700 capitalize">{{ key }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking Widget -->
      <aside>
        <div class="sticky top-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
          <div class="flex items-baseline justify-between mb-8">
            <div class="text-3xl font-black text-slate-900">${{ property.base_price }}<span class="text-sm text-slate-400 font-medium tracking-normal"> / night</span></div>
          </div>

          <form @submit.prevent="handleBook" class="space-y-6">
            <div class="grid grid-cols-1 gap-4">
              <div class="relative">
                <label class="absolute -top-2.5 left-4 px-2 bg-white text-[10px] font-black uppercase tracking-widest text-slate-400">Check-in</label>
                <input v-model="startDate" type="date" class="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
              </div>
              <div class="relative">
                <label class="absolute -top-2.5 left-4 px-2 bg-white text-[10px] font-black uppercase tracking-widest text-slate-400">Check-out</label>
                <input v-model="endDate" type="date" class="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
              </div>
            </div>

            <div v-if="startDate && endDate" class="bg-indigo-50/50 p-4 rounded-2xl space-y-2">
               <div v-if="checkingAvailability" class="flex items-center text-sm text-indigo-600">
                 <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Verifying availability...
               </div>
               <div v-else-if="isAvailable === true" class="flex items-center text-sm text-emerald-600 font-bold">
                 <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                 Dates available
               </div>
               <div v-else-if="isAvailable === false" class="flex items-center text-sm text-rose-600 font-bold">
                 <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 Sold out for these dates
               </div>
            </div>

            <div v-if="totalPrice > 0" class="pt-4 border-t border-slate-100 space-y-3">
               <div class="flex justify-between text-slate-600">
                 <span>${{ property.base_price }} x nights</span>
                 <span>${{ totalPrice }}</span>
               </div>
               <div class="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-50">
                 <span>Total</span>
                 <span>${{ totalPrice }}</span>
               </div>
            </div>

            <button 
              type="submit"
              :disabled="!isAvailable || checkingAvailability"
              class="w-full py-4 bg-indigo-600 text-white rounded-[1.25rem] font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-200 disabled:shadow-none transition-all active:scale-[0.98]"
            >
              {{ authStore.isAuthenticated ? 'Confirm Booking' : 'Sign in to Reserve' }}
            </button>

            <p class="text-center text-xs text-slate-400">Free cancellation within 48 hours</p>
          </form>
        </div>
      </aside>
    </div>
  </div>
  <!-- Skeleton Loader -->
  <div v-else class="animate-pulse space-y-12">
    <div class="h-10 bg-slate-100 w-1/3 rounded-xl"></div>
    <div class="grid lg:grid-cols-3 gap-12">
      <div class="lg:col-span-2 h-96 bg-slate-100 rounded-[2.5rem]"></div>
      <div class="h-96 bg-slate-100 rounded-[2.5rem]"></div>
    </div>
  </div>
</template>
