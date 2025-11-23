
<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <button
        @click="refreshData"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
      >
        🔄 Yenile
      </button>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium opacity-90">Toplam Müşteri</h3>
          <span class="text-2xl">👥</span>
        </div>
        <p class="text-4xl font-bold">{{ analytics?.overview?.totalCustomers || 0 }}</p>
        <p class="text-sm opacity-75 mt-2">
          +{{ analytics?.overview?.newCustomers || 0 }} son 30 günde
        </p>
      </div>

      <div class="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium opacity-90">Toplam Gelir</h3>
          <span class="text-2xl">💰</span>
        </div>
        <p class="text-4xl font-bold">{{ formatCurrency(analytics?.overview?.totalRevenue || 0) }}</p>
        <p class="text-sm opacity-75 mt-2">
          {{ analytics?.overview?.wonDealsCount || 0 }} kazanılan fırsat
        </p>
      </div>

      <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium opacity-90">Potansiyel Gelir</h3>
          <span class="text-2xl">📊</span>
        </div>
        <p class="text-4xl font-bold">{{ formatCurrency(analytics?.overview?.pipelineValue || 0) }}</p>
        <p class="text-sm opacity-75 mt-2">
          {{ analytics?.overview?.activeDeals || 0 }} aktif fırsat
        </p>
      </div>

      <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium opacity-90">Başarı Oranı</h3>
          <span class="text-2xl">🎯</span>
        </div>
        <p class="text-4xl font-bold">%{{ analytics?.overview?.winRate || 0 }}</p>
        <p class="text-sm opacity-75 mt-2">
          Kazanma oranı
        </p>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Fırsat Aşamaları -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold mb-4">Fırsat Aşamaları</h3>
        <div class="h-64">
          <DoughnutChart v-if="dealStagesData" :data="dealStagesData" />
        </div>
      </div>

      <!-- Müşteri Durumları -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold mb-4">Müşteri Durumları</h3>
        <div class="h-64">
          <DoughnutChart v-if="customerStatusData" :data="customerStatusData" />
        </div>
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Görev Durumları -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold mb-4">Görev Durumları</h3>
        <div class="h-64">
          <BarChart v-if="taskStatusData" :data="taskStatusData" />
        </div>
      </div>

      <!-- Aktivite Tipleri -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold mb-4">Aktivite Tipleri</h3>
        <div class="h-64">
          <BarChart v-if="activityTypeData" :data="activityTypeData" />
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
      <NuxtLink
        to="/customers"
        class="bg-blue-500 text-white p-6 rounded-lg shadow-md hover:bg-blue-600 transition-colors text-center"
      >
        <div class="text-3xl mb-2">👥</div>
        <div class="font-semibold">Müşteriler</div>
      </NuxtLink>

      <NuxtLink
        to="/tasks"
        class="bg-green-500 text-white p-6 rounded-lg shadow-md hover:bg-green-600 transition-colors text-center"
      >
        <div class="text-3xl mb-2">✅</div>
        <div class="font-semibold">Görevler</div>
      </NuxtLink>

      <NuxtLink
        to="/deals"
        class="bg-purple-500 text-white p-6 rounded-lg shadow-md hover:bg-purple-600 transition-colors text-center"
      >
        <div class="text-3xl mb-2">💼</div>
        <div class="font-semibold">Fırsatlar</div>
      </NuxtLink>

      <NuxtLink
        to="/activities"
        class="bg-orange-500 text-white p-6 rounded-lg shadow-md hover:bg-orange-600 transition-colors text-center"
      >
        <div class="text-3xl mb-2">📊</div>
        <div class="font-semibold">Aktiviteler</div>
      </NuxtLink>

      <NuxtLink
        to="/reports"
        class="bg-pink-500 text-white p-6 rounded-lg shadow-md hover:bg-pink-600 transition-colors text-center"
      >
        <div class="text-3xl mb-2">📈</div>
        <div class="font-semibold">Raporlar</div>
      </NuxtLink>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-xl font-semibold mb-4">Son Aktiviteler</h3>
      <div class="space-y-3">
        <div
          v-for="activity in recentActivities.slice(0, 5)"
          :key="activity._id"
          class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
        >
          <div class="text-2xl">{{ getActivityIcon(activity.type) }}</div>
          <div class="flex-1">
            <div class="font-medium">{{ activity.subject }}</div>
            <div class="text-sm text-gray-600">
              {{ activity.customer?.firstName }} {{ activity.customer?.lastName }} -
              {{ formatDateTime(activity.createdAt) }}
            </div>
          </div>
          <span
            v-if="activity.outcome"
            class="px-2 py-1 rounded text-xs"
            :class="getOutcomeClass(activity.outcome)"
          >
            {{ getOutcomeText(activity.outcome) }}
          </span>
        </div>
      </div>
      <NuxtLink to="/activities" class="block text-center text-blue-500 hover:underline mt-4">
        Tümünü Gör →
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: analyticsData, refresh: refreshAnalytics } = await useFetch('/api/analytics/dashboard')
const { data: activitiesData } = await useFetch('/api/activities', { query: { limit: 5 } })

const analytics = computed(() => analyticsData.value?.data)
const recentActivities = computed(() => activitiesData.value?.data || [])

const refreshData = () => {
  refreshAnalytics()
}

// Deal Stages Chart Data
const dealStagesData = computed(() => {
  if (!analytics.value?.dealsByStage) return null

  const stages = analytics.value.dealsByStage
  const stageLabels: any = {
    lead: 'Lead',
    qualified: 'Kalifiye',
    proposal: 'Teklif',
    negotiation: 'Müzakere',
    won: 'Kazanıldı',
    lost: 'Kaybedildi',
  }

  return {
    labels: stages.map((s: any) => stageLabels[s._id] || s._id),
    datasets: [{
      data: stages.map((s: any) => s.count),
      backgroundColor: [
        '#9CA3AF',
        '#3B82F6',
        '#8B5CF6',
        '#F59E0B',
        '#10B981',
        '#EF4444',
      ],
    }],
  }
})

// Customer Status Chart Data
const customerStatusData = computed(() => {
  if (!analytics.value?.customersByStatus) return null

  const statuses = analytics.value.customersByStatus
  const statusLabels: any = {
    lead: 'Lead',
    prospect: 'Prospect',
    customer: 'Müşteri',
    inactive: 'Pasif',
  }

  return {
    labels: statuses.map((s: any) => statusLabels[s._id] || s._id),
    datasets: [{
      data: statuses.map((s: any) => s.count),
      backgroundColor: [
        '#3B82F6',
        '#F59E0B',
        '#10B981',
        '#6B7280',
      ],
    }],
  }
})

// Task Status Chart Data
const taskStatusData = computed(() => {
  if (!analytics.value?.tasksByStatus) return null

  const statuses = analytics.value.tasksByStatus
  const statusLabels: any = {
    pending: 'Bekliyor',
    'in-progress': 'Devam Ediyor',
    completed: 'Tamamlandı',
    cancelled: 'İptal',
  }

  return {
    labels: statuses.map((s: any) => statusLabels[s._id] || s._id),
    datasets: [{
      label: 'Görev Sayısı',
      data: statuses.map((s: any) => s.count),
      backgroundColor: [
        '#F59E0B',
        '#3B82F6',
        '#10B981',
        '#6B7280',
      ],
    }],
  }
})

// Activity Type Chart Data
const activityTypeData = computed(() => {
  if (!analytics.value?.activitiesByType) return null

  const types = analytics.value.activitiesByType
  const typeLabels: any = {
    call: 'Görüşme',
    email: 'E-posta',
    meeting: 'Toplantı',
    note: 'Not',
    task: 'Görev',
    deal: 'Fırsat',
  }

  return {
    labels: types.map((t: any) => typeLabels[t._id] || t._id),
    datasets: [{
      label: 'Aktivite Sayısı',
      data: types.map((t: any) => t.count),
      backgroundColor: [
        '#3B82F6',
        '#10B981',
        '#8B5CF6',
        '#F59E0B',
        '#F97316',
        '#EC4899',
      ],
    }],
  }
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('tr-TR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getActivityIcon = (type: string) => {
  const icons: any = {
    call: '📞',
    email: '✉️',
    meeting: '👥',
    note: '📝',
    task: '✅',
    deal: '💼',
  }
  return icons[type] || '📊'
}

const getOutcomeClass = (outcome: string) => {
  const classes: any = {
    successful: 'bg-green-100 text-green-800',
    unsuccessful: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    scheduled: 'bg-blue-100 text-blue-800',
  }
  return classes[outcome] || ''
}

const getOutcomeText = (outcome: string) => {
  const texts: any = {
    successful: 'Başarılı',
    unsuccessful: 'Başarısız',
    pending: 'Beklemede',
    scheduled: 'Planlandı',
  }
  return texts[outcome] || outcome
}
</script>