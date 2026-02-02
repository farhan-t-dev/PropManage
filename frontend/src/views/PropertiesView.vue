<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '../api'
import PropertyCard from '../components/PropertyCard.vue'

const units = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')
const minPrice = ref('')
const maxPrice = ref('')

const fetchUnits = async () => {
  loading.value = true
  try {
    const params = {
      search: search.value,
      min_price: minPrice.value,
      max_price: maxPrice.value
    }
    const res = await api.get('/units/', { params })
    units.value = res.data.results || res.data
  } catch (err) {
    error.value = 'Failed to load units.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchUnits)
watch([minPrice, maxPrice], fetchUnits)
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="max-w-xl">
        <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Explore Units</h1>
        <p class="text-slate-500">Find luxury suites and apartments tailored to your lifestyle.</p>
      </div>
      
      <div class="relative w-full md:w-80">
        <input v-model="search" @keyup.enter="fetchUnits" type="text" placeholder="Search suites..." class="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
        <svg class="absolute left-4 top-3.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <aside class="w-full lg:w-64">
        <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Filters</h3>
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-3">Price Range</label>
              <div class="flex items-center gap-2">
                <input v-model="minPrice" type="number" placeholder="Min" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none">
                <input v-model="maxPrice" type="number" placeholder="Max" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none">
              </div>
            </div>
          </div>
          <button @click="fetchUnits" class="w-full mt-8 px-4 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors">Apply Filters</button>
        </div>
      </aside>

      <div class="flex-1">
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div v-for="n in 4" :key="n" class="h-80 bg-slate-100 rounded-[2rem] animate-pulse"></div>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PropertyCard v-for="unit in units" :key="unit.id" :property="unit" />
        </div>
      </div>
    </div>
  </div>
</template>
