<template>
  <div>
    <NuxtLayout v-if="!isAuthPage">
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </NuxtLayout>
    <div v-else>
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register'
})
</script>