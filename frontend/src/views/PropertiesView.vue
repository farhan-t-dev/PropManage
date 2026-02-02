<script setup>
import { ref, onMounted, watch } from 'vue'
import { usePropertyStore } from '../stores/properties'
import PropertyCard from '../components/PropertyCard.vue'

const propertyStore = usePropertyStore()
const search = ref('')
const minPrice = ref('')
const maxPrice = ref('')

const fetchFiltered = () => {
  const params = {}
  if (search.value) params.search = search.value
  if (minPrice.value) params.min_price = minPrice.value
  if (maxPrice.value) params.max_price = maxPrice.value
  propertyStore.fetchProperties(params)
}

onMounted(() => {
  propertyStore.fetchProperties()
})

// Debounced search could be added here, but simple watch for now
watch([minPrice, maxPrice], () => {
  fetchFiltered()
})
</script>

<template>
  <div class="space-y-8">
    <!-- Search and Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="max-w-xl">
        <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Discover Properties</h1>
        <p class="text-slate-500">Find the perfect place for your next stay or long-term rental.</p>
      </div>
      
      <div class="relative w-full md:w-80">
        <input 
          v-model="search"
          @keyup.enter="fetchFiltered"
          type="text" 
          placeholder="Search locations or titles..."
          class="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        >
        <svg class="absolute left-4 top-3.5 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Filters Sidebar -->
      <aside class="w-full lg:w-64 space-y-8">
        <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Filters</h3>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-3">Price Range</label>
              <div class="flex items-center gap-2">
                <input v-model="minPrice" type="number" placeholder="Min" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20">
                <span class="text-slate-300">-</span>
                <input v-model="maxPrice" type="number" placeholder="Max" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20">
              </div>
            </div>

            <!-- More filters can go here -->
          </div>

          <button @click="fetchFiltered" class="w-full mt-8 px-4 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors">
            Apply Filters
          </button>
        </div>
      </aside>

      <!-- Results Grid -->
      <div class="flex-1">
        <div v-if="propertyStore.loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <!-- Skeleton Loader -->
           <div v-for="n in 4" :key="n" class="h-80 bg-slate-100 rounded-[2rem] animate-pulse"></div>
        </div>

        <div v-else-if="propertyStore.error" class="bg-red-50 p-6 rounded-[2rem] border border-red-100">
          <p class="text-red-700 font-medium">{{ propertyStore.error }}</p>
        </div>

        <div v-else-if="propertyStore.properties.length === 0" class="text-center py-20 bg-white rounded-[2rem] border border-slate-100">
           <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
           </div>
           <h3 class="text-xl font-bold text-slate-900 mb-2">No properties found</h3>
           <p class="text-slate-500">Try adjusting your search or filters.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PropertyCard 
            v-for="property in propertyStore.properties" 
            :key="property.id" 
            :property="property" 
          />
        </div>
      </div>
    </div>
  </div>
</template>
