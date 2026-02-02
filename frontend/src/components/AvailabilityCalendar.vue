<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  bookedDates: {
    type: Array,
    default: () => [] // Array of { start, end }
  }
})

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const daysInMonth = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0).getDate())
const firstDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value, 1).getDay())

const isBooked = (day) => {
  const date = new Date(currentYear.value, currentMonth.value, day)
  return props.bookedDates.some(booking => {
    const start = new Date(booking.start_date)
    const end = new Date(booking.end_date)
    return date >= start && date <= end
  })
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}
</script>

<template>
  <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-sm font-black uppercase tracking-widest text-slate-900">{{ monthNames[currentMonth] }} {{ currentYear }}</h3>
      <div class="flex gap-2">
        <button @click="prevMonth" class="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button @click="nextMonth" class="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1 text-center mb-2">
      <div v-for="d in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="d" class="text-[10px] font-black text-slate-300 uppercase">{{ d }}</div>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <div v-for="empty in firstDayOfMonth" :key="'empty-'+empty" class="h-10"></div>
      <div 
        v-for="day in daysInMonth" 
        :key="day"
        :class="[
          'h-10 flex items-center justify-center text-xs font-bold rounded-xl transition-all',
          isBooked(day) ? 'bg-rose-50 text-rose-400 cursor-not-allowed line-through' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer'
        ]"
      >
        {{ day }}
      </div>
    </div>

    <div class="mt-6 flex gap-4">
       <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-rose-100 rounded-full"></div>
          <span class="text-[10px] font-bold text-slate-400 uppercase">Booked</span>
       </div>
       <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-indigo-100 rounded-full"></div>
          <span class="text-[10px] font-bold text-slate-400 uppercase">Available</span>
       </div>
    </div>
  </div>
</template>
