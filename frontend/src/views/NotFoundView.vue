<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-100px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <div>
        <h2 class="mt-6 text-center text-6xl font-extrabold text-indigo-600">
          404
        </h2>
        <p class="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Page Not Found
        </p>
        <p class="mt-2 text-center text-sm text-gray-600">
          The page you're looking for doesn't exist or an unexpected error occurred.
        </p>
      </div>
      <div class="mt-6">
        <router-link to="/" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Go back to Home
        </router-link>
      </div>
    </div>
  </div>
</template>