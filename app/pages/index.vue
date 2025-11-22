
<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">CRM Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
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
        <h3 class="text-gray-500 text-sm font-medium mb-2">Aktif Fırsatlar</h3>
        <p class="text-3xl font-bold">{{ activeDeals }}</p>
        <NuxtLink to="/deals" class="text-blue-500 text-sm hover:underline mt-2 inline-block">
          Fırsatları Gör →
        </NuxtLink>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-gray-500 text-sm font-medium mb-2">Potansiyel Gelir</h3>
        <p class="text-3xl font-bold text-green-600">{{ formatCurrency(pipelineValue) }}</p>
        <NuxtLink to="/deals" class="text-blue-500 text-sm hover:underline mt-2 inline-block">
          Detayları Gör →
        </NuxtLink>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-gray-500 text-sm font-medium mb-2">Aktiviteler</h3>
        <p class="text-3xl font-bold text-purple-600">{{ activities?.length || 0 }}</p>
        <NuxtLink to="/activities" class="text-blue-500 text-sm hover:underline mt-2 inline-block">
          Geçmişi Gör →
        </NuxtLink>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-gray-500 text-sm font-medium mb-2">Gönderilen E-posta</h3>
        <p class="text-3xl font-bold text-orange-600">{{ sentEmails }}</p>
        <NuxtLink to="/emails" class="text-blue-500 text-sm hover:underline mt-2 inline-block">
          E-postaları Gör →
        </NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
      <NuxtLink to="/customers" class="bg-blue-500 text-white p-8 rounded-lg shadow-md hover:bg-blue-600 transition-colors text-center">
        <h2 class="text-2xl font-bold mb-2">👥 Müşteriler</h2>
        <p>Müşterilerinizi yönetin</p>
      </NuxtLink>

      <NuxtLink to="/tasks" class="bg-green-500 text-white p-8 rounded-lg shadow-md hover:bg-green-600 transition-colors text-center">
        <h2 class="text-2xl font-bold mb-2">✅ Görevler</h2>
        <p>Görevlerinizi takip edin</p>
      </NuxtLink>

      <NuxtLink to="/deals" class="bg-purple-500 text-white p-8 rounded-lg shadow-md hover:bg-purple-600 transition-colors text-center">
        <h2 class="text-2xl font-bold mb-2">💼 Fırsatlar</h2>
        <p>Satış fırsatlarını yönetin</p>
      </NuxtLink>

      <NuxtLink to="/activities" class="bg-orange-500 text-white p-8 rounded-lg shadow-md hover:bg-orange-600 transition-colors text-center">
        <h2 class="text-2xl font-bold mb-2">📊 Aktiviteler</h2>
        <p>Etkileşim geçmişi</p>
      </NuxtLink>

      <NuxtLink to="/emails" class="bg-pink-500 text-white p-8 rounded-lg shadow-md hover:bg-pink-600 transition-colors text-center">
        <h2 class="text-2xl font-bold mb-2">✉️ E-postalar</h2>
        <p>E-posta gönder ve yönet</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: customersData } = await useFetch('/api/customers')
const { data: tasksData } = await useFetch('/api/tasks')
const { data: dealsData } = await useFetch('/api/deals')
const { data: activitiesData } = await useFetch('/api/activities')
const { data: emailsData } = await useFetch('/api/emails')

const customers = computed(() => customersData.value?.data || [])
const tasks = computed(() => tasksData.value?.data || [])
const deals = computed(() => dealsData.value?.data || [])
const activities = computed(() => activitiesData.value?.data || [])
const emails = computed(() => emailsData.value?.data || [])

const activeTasks = computed(() => {
  return tasks.value.filter((task: any) =>
    task.status !== 'completed' && task.status !== 'cancelled'
  ).length
})

const activeDeals = computed(() => {
  return deals.value.filter((deal: any) =>
    !['won', 'lost'].includes(deal.stage)
  ).length
})

const pipelineValue = computed(() => {
  return deals.value
    .filter((d: any) => !['won', 'lost'].includes(d.stage))
    .reduce((sum: number, d: any) => sum + (d.value * d.probability / 100), 0)
})

const sentEmails = computed(() => {
  return emails.value.filter((e: any) => e.status === 'sent').length
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(value)
}
</script>