<script setup>
import { onMounted } from 'vue'
import { usePropertyStore } from '../stores/properties'
import PropertyCard from '../components/PropertyCard.vue'

const propertyStore = usePropertyStore()

onMounted(() => {
  propertyStore.fetchProperties()
})
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-gray-900">Available Properties</h1>
      <p class="mt-2 text-sm text-gray-700">Explore our curated selection of properties for your next stay.</p>
    </div>

    <div v-if="propertyStore.loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="propertyStore.error" class="bg-red-50 p-4 rounded-md">
      <p class="text-red-700">{{ propertyStore.error }}</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <PropertyCard 
        v-for="property in propertyStore.properties" 
        :key="property.id" 
        :property="property" 
      />
    </div>

    <div v-if="!propertyStore.loading && propertyStore.properties.length === 0" class="text-center py-12">
      <p class="text-gray-500 text-lg">No properties found.</p>
    </div>
  </div>
</template>
