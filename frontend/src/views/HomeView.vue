<script setup>
import { useAuthStore } from '../stores/auth'
const auth = useAuthStore()
</script>

<template>
  <div class="space-y-20 pb-20">
    <!-- Hero Section -->
    <section class="relative">
      <div class="max-w-4xl">
        <h1 class="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
          Property Management <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Reimagined.</span>
        </h1>
        <p class="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl">
          Streamline your rental business with automated booking, intelligent scheduling, and seamless invoicing. Built for modern landlords and discerning tenants.
        </p>
        <div class="flex flex-wrap gap-4">
          <router-link to="/properties" class="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
            Explore Properties
          </router-link>
          <router-link v-if="!auth.isAuthenticated" to="/login" class="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            Landlord Portal
          </router-link>
        </div>
      </div>
      
      <!-- Decorative Element -->
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl -z-10 opacity-60"></div>
    </section>

    <!-- Features Grid -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">Smart Scheduling</h3>
        <p class="text-slate-600">Automated availability checks and conflict resolution for hassle-free bookings.</p>
      </div>

      <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">Automated Invoicing</h3>
        <p class="text-slate-600">Professional PDF invoices generated instantly upon booking confirmation.</p>
      </div>

      <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">Instant Notifications</h3>
        <p class="text-slate-600">Real-time alerts for new bookings, cancellations, and payment statuses.</p>
      </div>
    </section>

    <!-- Social Proof/Stats -->
    <section class="bg-slate-900 rounded-[2.5rem] p-12 text-white overflow-hidden relative">
      <div class="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div class="text-4xl font-bold mb-1">500+</div>
          <div class="text-slate-400 text-sm">Active Listings</div>
        </div>
        <div>
          <div class="text-4xl font-bold mb-1">12k</div>
          <div class="text-slate-400 text-sm">Monthly Bookings</div>
        </div>
        <div>
          <div class="text-4xl font-bold mb-1">99.9%</div>
          <div class="text-slate-400 text-sm">Uptime</div>
        </div>
        <div>
          <div class="text-4xl font-bold mb-1">4.9/5</div>
          <div class="text-slate-400 text-sm">Host Rating</div>
        </div>
      </div>
      <!-- Background Glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/10 blur-[120px]"></div>
    </section>
  </div>
</template>
