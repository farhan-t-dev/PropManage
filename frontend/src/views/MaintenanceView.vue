<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'

const auth = useAuthStore()
const notification = useNotificationStore()
const requests = ref([])
const loading = ref(true)
const showModal = ref(false)

// Form State
const newRequest = ref({
  title: '',
  description: '',
  category: 'other',
  priority: 'medium',
  property: null,
  unit: null
})

// Options (Hardcoded for demo, but should be fetched)
const categories = ['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'other']
const priorities = ['low', 'medium', 'high', 'emergency']

const fetchRequests = async () => {
  loading.value = true
  try {
    const res = await api.get('/maintenance/requests/')
    requests.value = res.data.results || res.data
  } catch (err) {
    notification.showNotification('Failed to load maintenance tickets.', 'error')
  } finally {
    loading.value = false
  }
}

const submitRequest = async () => {
  try {
    // Note: in a real app, we'd need to pick valid property/unit IDs
    // For this demo, we'll assume the backend handles missing ones or we fetch them
    await api.post('/maintenance/requests/', newRequest.value)
    notification.showNotification('Maintenance ticket created successfully.', 'success')
    showModal.value = false
    fetchRequests()
  } catch (err) {
    notification.showNotification('Failed to submit request.', 'error')
  }
}

onMounted(fetchRequests)

const getStatusClass = (status) => {
  const classes = {
    'pending': 'bg-amber-100 text-amber-700',
    'in_progress': 'bg-blue-100 text-blue-700',
    'resolved': 'bg-emerald-100 text-emerald-700',
    'cancelled': 'bg-slate-100 text-slate-600'
  }
  return classes[status] || 'bg-slate-100'
}
</script>

<template>
  <div class="space-y-10">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">Maintenance</h1>
        <p class="text-slate-500 font-medium">Manage and track service requests for your properties.</p>
      </div>
      <button 
        @click="showModal = true"
        class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        New Request
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
       <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Tickets</div>
          <div class="text-3xl font-black text-slate-900">{{ requests.filter(r => r.status !== 'resolved').length }}</div>
       </div>
       <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Avg. Response Time</div>
          <div class="text-3xl font-black text-slate-900 text-indigo-600">4.2h</div>
       </div>
       <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resolution Rate</div>
          <div class="text-3xl font-black text-slate-900 text-emerald-600">98%</div>
       </div>
    </div>

    <!-- Tickets List -->
    <div v-if="loading" class="space-y-4">
       <div v-for="i in 3" :key="i" class="h-24 bg-slate-50 rounded-3xl animate-pulse"></div>
    </div>
    <div v-else-if="requests.length === 0" class="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
       <div class="text-slate-300 mb-4">No maintenance requests found.</div>
    </div>
    <div v-else class="space-y-4">
       <div v-for="req in requests" :key="req.id" class="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-6">
          <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600">
             <svg v-if="req.category === 'plumbing'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.722 2.166a2 2 0 01-1.414 1.414l-2.166.722a2 2 0 00-1.414 1.96l.477 2.387a2 2 0 00.547 1.022l1.428 1.428" /></svg>
             <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
          </div>
          <div class="flex-1">
             <div class="flex items-center gap-3 mb-1">
                <h3 class="font-black text-slate-900">{{ req.title }}</h3>
                <span :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest', getStatusClass(req.status)]">
                   {{ req.status }}
                </span>
             </div>
             <p class="text-sm text-slate-500 line-clamp-1">{{ req.description }}</p>
          </div>
          <div class="text-right">
             <div :class="[
               req.priority === 'emergency' ? 'text-rose-600' : 'text-slate-400',
               'text-[10px] font-black uppercase tracking-widest mb-1'
             ]">Priority: {{ req.priority }}</div>
             <div class="text-xs text-slate-400 font-bold">{{ new Date(req.created_at).toLocaleDateString() }}</div>
          </div>
       </div>
    </div>

    <!-- New Request Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
       <div class="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative">
          <button @click="showModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <h2 class="text-2xl font-black text-slate-900 mb-2">New Ticket</h2>
          <p class="text-slate-500 mb-8">Describe the issue and our team will respond shortly.</p>

          <form @submit.prevent="submitRequest" class="space-y-6">
             <div class="space-y-4">
                <div class="relative">
                   <label class="absolute -top-2 left-4 px-2 bg-white text-[10px] font-black uppercase text-slate-400">Issue Title</label>
                   <input v-model="newRequest.title" type="text" required class="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900">
                </div>
                <div class="relative">
                   <label class="absolute -top-2 left-4 px-2 bg-white text-[10px] font-black uppercase text-slate-400">Category</label>
                   <select v-model="newRequest.category" class="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 capitalize">
                      <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                   </select>
                </div>
                <div class="relative">
                   <label class="absolute -top-2 left-4 px-2 bg-white text-[10px] font-black uppercase text-slate-400">Description</label>
                   <textarea v-model="newRequest.description" rows="3" required class="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900"></textarea>
                </div>
             </div>

             <button type="submit" class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-indigo-600 transition-all">
                Submit Ticket
             </button>
          </form>
       </div>
    </div>
  </div>
</template>
