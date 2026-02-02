<script setup>
defineProps({
  property: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
    <div class="p-5">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-bold text-gray-900 truncate">{{ property.title }}</h3>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ${{ property.base_price }} / night
        </span>
      </div>
      <p class="text-sm text-gray-500 line-clamp-2 mb-4">
        {{ property.description }}
      </p>
      <div class="flex items-center text-xs text-gray-400 mb-4">
        <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {{ property.address }}
      </div>
      <div class="mt-4">
        <router-link :to="{ name: 'property-detail', params: { id: property.id }}" class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          View Details & Book
        </router-link>
      </div>
    </div>
  </div>
</template>
