<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications' // Import notification store
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore() // Initialize notification store

const title = ref('')
const description = ref('')
const address = ref('')
const basePrice = ref('')
const errors = ref({})
const loading = ref(false)

// Features management
const commonFeatures = ref([
  { name: 'pool', label: 'Pool', value: false },
  { name: 'wifi', label: 'Wi-Fi', value: false },
  { name: 'parking', label: 'Parking', value: false },
  { name: 'gym', label: 'Gym', value: false },
  { name: 'air_conditioning', label: 'Air Conditioning', value: false },
])

const customFeatures = ref([])
const newCustomFeatureKey = ref('')
const newCustomFeatureValue = ref('')

const addCustomFeature = () => {
  if (newCustomFeatureKey.value && newCustomFeatureValue.value) {
    customFeatures.value.push({ 
      key: newCustomFeatureKey.value, 
      value: newCustomFeatureValue.value 
    })
    newCustomFeatureKey.value = ''
    newCustomFeatureValue.value = ''
  }
}

const removeCustomFeature = (index) => {
  customFeatures.value.splice(index, 1)
}

const createProperty = async () => {
  errors.value = {}
  loading.value = true

  if (!authStore.isAuthenticated) {
    router.push('/login')
    notificationStore.showNotification('Please log in to create a property.', 'error')
    return
  }

  try {
    const propertyFeatures = {}
    commonFeatures.value.forEach(f => {
      propertyFeatures[f.name] = f.value
    })
    customFeatures.value.forEach(f => {
      // Basic type inference for boolean/number, otherwise string
      let parsedValue = f.value
      if (f.value === 'true') parsedValue = true
      else if (f.value === 'false') parsedValue = false
      else if (!isNaN(Number(f.value)) && !isNaN(parseFloat(f.value))) parsedValue = Number(f.value)
      
      propertyFeatures[f.key] = parsedValue
    })

    const payload = {
      title: title.value,
      description: description.value,
      address: address.value,
      base_price: parseFloat(basePrice.value),
      features: propertyFeatures,
    }

    await axios.post('http://localhost:8000/api/properties/', payload, {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    notificationStore.showNotification('Property created successfully!', 'success')
    router.push('/landlord-dashboard')
  } catch (err) {
    if (err.response && err.response.data) {
      errors.value = err.response.data
      notificationStore.showNotification('Error creating property!', 'error')
    } else {
      errors.value = { non_field_errors: ['An unexpected error occurred.'] }
      notificationStore.showNotification('An unexpected error occurred!', 'error')
    }
    console.error('Property creation failed:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-8">
    <h1 class="text-3xl font-extrabold text-gray-900 mb-6">List a New Property</h1>
    <form @submit.prevent="createProperty" class="space-y-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
        <input type="text" id="title" v-model="title" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
        <p v-if="errors.title" class="mt-2 text-sm text-red-600">{{ errors.title[0] }}</p>
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
        <textarea id="description" v-model="description" rows="4" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required></textarea>
        <p v-if="errors.description" class="mt-2 text-sm text-red-600">{{ errors.description[0] }}</p>
      </div>

      <div>
        <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
        <input type="text" id="address" v-model="address" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
        <p v-if="errors.address" class="mt-2 text-sm text-red-600">{{ errors.address[0] }}</p>
      </div>

      <div>
        <label for="basePrice" class="block text-sm font-medium text-gray-700">Base Price per Night ($)</label>
        <input type="number" id="basePrice" v-model="basePrice" step="0.01" min="0" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
        <p v-if="errors.base_price" class="mt-2 text-sm text-red-600">{{ errors.base_price[0] }}</p>
      </div>

      <!-- Features Section -->
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">Property Features</h3>
        <p v-if="errors.features" class="mt-2 text-sm text-red-600">{{ errors.features[0] }}</p>

        <!-- Common Features Checkboxes -->
        <div class="mt-2 grid grid-cols-2 gap-y-2 gap-x-4 sm:grid-cols-3">
          <div v-for="feature in commonFeatures" :key="feature.name" class="relative flex items-start">
            <div class="flex items-center h-5">
              <input :id="feature.name" :name="feature.name" type="checkbox" v-model="feature.value" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
            </div>
            <div class="ml-3 text-sm">
              <label :for="feature.name" class="font-medium text-gray-700">{{ feature.label }}</label>
            </div>
          </div>
        </div>

        <!-- Custom Features Input -->
        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700">Custom Features</label>
          <div class="mt-1 flex space-x-2">
            <input type="text" v-model="newCustomFeatureKey" placeholder="Feature Name (e.g., 'balcony')" class="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <input type="text" v-model="newCustomFeatureValue" placeholder="Value (e.g., 'true' or '2')" class="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <button type="button" @click="addCustomFeature" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Add
            </button>
          </div>
          <p class="mt-2 text-sm text-gray-500">Add key-value pairs for additional features.</p>
        </div>

        <!-- Display Custom Features -->
        <ul v-if="customFeatures.length > 0" class="mt-4 border-t border-b border-gray-200 divide-y divide-gray-200">
          <li v-for="(feature, index) in customFeatures" :key="index" class="py-2 flex justify-between items-center">
            <span class="text-sm text-gray-700">{{ feature.key }}: {{ feature.value }}</span>
            <button type="button" @click="removeCustomFeature(index)" class="text-red-600 hover:text-red-900 text-sm font-medium">Remove</button>
          </li>
        </ul>
      </div>

      <div v-if="errors.non_field_errors" class="mt-2 text-sm text-red-600">
        <p v-for="error in errors.non_field_errors" :key="error">{{ error }}</p>
      </div>

      <button type="submit" :disabled="loading" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <span v-if="loading">Creating Property...</span>
        <span v-else>Create Property</span>
      </button>
    </form>
  </div>
</template>