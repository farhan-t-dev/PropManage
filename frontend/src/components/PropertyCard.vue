<script setup>
defineProps({
  property: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
    <!-- Image Placeholder with Gradient -->
    <div class="relative h-48 bg-slate-100 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 group-hover:scale-110 transition-transform duration-500"></div>
      <div class="absolute inset-0 flex items-center justify-center text-slate-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      </div>
      <div class="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur shadow-sm rounded-xl text-xs font-bold text-slate-900">
        ${{ property.base_price }}<span class="text-slate-500 font-medium">/night</span>
      </div>
    </div>

    <div class="p-6">
      <div class="flex flex-col mb-2">
        <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{{ property.property_title }}</span>
        <h3 class="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
          {{ property.title }} ({{ property.unit_number }})
        </h3>
      </div>
      
      <p class="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
        {{ property.description }}
      </p>

      <router-link 
        :to="{ name: 'unit-detail', params: { id: property.id }}" 
        class="w-full inline-flex justify-center items-center px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-all"
      >
        View Suite
        <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </router-link>
    </div>
  </div>
</template>
