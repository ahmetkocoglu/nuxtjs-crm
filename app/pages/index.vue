
<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">CRM Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-gray-500 text-sm font-medium mb-2">Toplam Müşteri</h3>
        <p class="text-3xl font-bold">{{ customers?.length || 0 }}</p>
        <NuxtLink to="/customers" class="text-blue-500 text-sm hover:underline mt-2 inline-block">
          Tümünü Gör →
        </NuxtLink>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-gray-500 text-sm font-medium mb-2">Aktif Görevler</h3>
        <p class="text-3xl font-bold">{{ activeTasks }}</p>
        <NuxtLink to="/tasks" class="text-blue-500 text-sm hover:underline mt-2 inline-block">
          Görevleri Gör →
        </NuxtLink>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-gray-500 text-sm font-medium mb-2">Gecikmiş Görevler</h3>
        <p class="text-3xl font-bold text-red-600">{{ overdueTasks }}</p>
        <NuxtLink to="/tasks" class="text-blue-500 text-sm hover:underline mt-2 inline-block">
          Detayları Gör →
        </NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <NuxtLink to="/customers" class="bg-blue-500 text-white p-8 rounded-lg shadow-md hover:bg-blue-600 transition-colors text-center">
        <h2 class="text-2xl font-bold mb-2">Müşteri Yönetimi</h2>
        <p>Müşterilerinizi görüntüleyin ve yönetin</p>
      </NuxtLink>

      <NuxtLink to="/tasks" class="bg-green-500 text-white p-8 rounded-lg shadow-md hover:bg-green-600 transition-colors text-center">
        <h2 class="text-2xl font-bold mb-2">Görev Yönetimi</h2>
        <p>Görevlerinizi takip edin ve yönetin</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: customersData } = await useFetch('/api/customers')
const { data: tasksData } = await useFetch('/api/tasks')

const customers = computed(() => customersData.value?.data || [])
const tasks = computed(() => tasksData.value?.data || [])

const activeTasks = computed(() => {
  return tasks.value.filter((task: any) =>
    task.status !== 'completed' && task.status !== 'cancelled'
  ).length
})

const overdueTasks = computed(() => {
  return tasks.value.filter((task: any) =>
    task.status !== 'completed' &&
    task.status !== 'cancelled' &&
    new Date(task.dueDate) < new Date()
  ).length
})
</script>