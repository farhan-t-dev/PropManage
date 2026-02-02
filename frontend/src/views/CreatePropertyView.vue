<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import api from '../api'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const loading = ref(false)
const property = ref({
  title: '',
  description: '',
  address: '',
})

const initialUnit = ref({
  unit_number: '101',
  title: 'Standard Suite',
  description: '',
  base_price: '',
  turnover_buffer_hours: 24,
})

const createProperty = async () => {
  loading.value = true
  try {
    // 1. Create the Property
    const propRes = await api.post('/properties/', property.value)
    const propertyId = propRes.data.id

    // 2. Create the Initial Unit for this property
    await api.post('/units/', {
      ...initialUnit.value,
      property: propertyId,
      features: { wifi: true, kitchen: true } // Default features
    })

    notificationStore.showNotification('Listing published successfully!', 'success')
    router.push('/landlord-dashboard')
  } catch (err) {
    notificationStore.showNotification('Failed to create listing.', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-10 pb-20">
    <div>
      <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">List New Property</h1>
      <p class="text-slate-500 font-medium">Define your property and its first bookable unit.</p>
    </div>

    <form @submit.prevent="createProperty" class="grid lg:grid-cols-2 gap-8">
      <!-- Property Info -->
      <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <h2 class="text-xl font-bold text-slate-900 border-b border-slate-50 pb-4">General Details</h2>
        <div class="space-y-4">
          <div class="relative">
            <label class="absolute -top-2 left-4 px-2 bg-white text-[10px] font-black uppercase text-slate-400 tracking-widest">Property Name</label>
            <input v-model="property.title" type="text" required class="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20">
          </div>
          <div class="relative">
            <label class="absolute -top-2 left-4 px-2 bg-white text-[10px] font-black uppercase text-slate-400 tracking-widest">Physical Address</label>
            <input v-model="property.address" type="text" required class="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20">
          </div>
          <div class="relative">
            <label class="absolute -top-2 left-4 px-2 bg-white text-[10px] font-black uppercase text-slate-400 tracking-widest">Overview</label>
            <textarea v-model="property.description" rows="4" required class="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20"></textarea>
          </div>
        </div>
      </div>

      <!-- Unit Info -->
      <div class="bg-indigo-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-xl shadow-indigo-200">
        <h2 class="text-xl font-bold border-b border-white/10 pb-4">Initial Unit Configuration</h2>
        <div class="space-y-4 text-slate-900">
          <div class="grid grid-cols-2 gap-4">
            <div class="relative">
              <label class="absolute -top-2 left-4 px-2 bg-indigo-900 text-[10px] font-black uppercase text-indigo-300 tracking-widest">Unit #</label>
              <input v-model="initialUnit.unit_number" type="text" required class="w-full px-4 py-4 bg-white/10 border border-white/10 rounded-2xl outline-none font-bold text-white focus:bg-white focus:text-slate-900">
            </div>
            <div class="relative">
              <label class="absolute -top-2 left-4 px-2 bg-indigo-900 text-[10px] font-black uppercase text-indigo-300 tracking-widest">Base Price ($)</label>
              <input v-model="initialUnit.base_price" type="number" required class="w-full px-4 py-4 bg-white/10 border border-white/10 rounded-2xl outline-none font-bold text-white focus:bg-white focus:text-slate-900">
            </div>
          </div>
          <div class="relative">
            <label class="absolute -top-2 left-4 px-2 bg-indigo-900 text-[10px] font-black uppercase text-indigo-300 tracking-widest">Unit Title</label>
            <input v-model="initialUnit.title" type="text" required class="w-full px-4 py-4 bg-white/10 border border-white/10 rounded-2xl outline-none font-bold text-white focus:bg-white focus:text-slate-900">
          </div>
          <div class="relative">
            <label class="absolute -top-2 left-4 px-2 bg-indigo-900 text-[10px] font-black uppercase text-indigo-300 tracking-widest">Buffer Gap (Hours)</label>
            <input v-model="initialUnit.turnover_buffer_hours" type="number" class="w-full px-4 py-4 bg-white/10 border border-white/10 rounded-2xl outline-none font-bold text-white focus:bg-white focus:text-slate-900">
          </div>
        </div>

        <button type="submit" :disabled="loading" class="w-full py-5 bg-white text-indigo-900 rounded-[1.25rem] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-[0.98] shadow-lg">
          <span v-if="loading">Finalizing...</span>
          <span v-else>Publish Listing</span>
        </button>
      </div>
    </form>
  </div>
</template>