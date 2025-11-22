<template>
  <div class="container mx-auto p-6">
    <div v-if="pending" class="text-center">Yükleniyor...</div>
    <div v-else-if="error" class="text-red-500">Hata: {{ error.message }}</div>
    <div v-else-if="customer">
      <!-- Müşteri Bilgileri -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h1 class="text-3xl font-bold mb-2">
              {{ customer.firstName }} {{ customer.lastName }}
            </h1>
            <p class="text-gray-600">{{ customer.company }}</p>
          </div>
          <NuxtLink
            to="/customers"
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            ← Geri
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <p class="text-sm text-gray-600">E-posta</p>
            <p class="font-medium">{{ customer.email }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Telefon</p>
            <p class="font-medium">{{ customer.phone || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Durum</p>
            <span
              class="px-2 py-1 rounded text-sm"
              :class="getStatusClass(customer.status)"
            >
              {{ getStatusText(customer.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow-md mb-6">
        <div class="border-b">
          <div class="flex">
            <button
              @click="activeTab = 'activities'"
              class="px-6 py-3 font-medium"
              :class="activeTab === 'activities' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'"
            >
              Aktiviteler ({{ customerActivities.length }})
            </button>
            <button
              @click="activeTab = 'deals'"
              class="px-6 py-3 font-medium"
              :class="activeTab === 'deals' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'"
            >
              Fırsatlar ({{ customerDeals.length }})
            </button>
            <button
              @click="activeTab = 'tasks'"
              class="px-6 py-3 font-medium"
              :class="activeTab === 'tasks' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'"
            >
              Görevler ({{ customerTasks.length }})
            </button>
          </div>
        </div>

        <div class="p-6">
          <!-- Aktiviteler Tab -->
          <div v-if="activeTab === 'activities'">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">Aktivite Geçmişi</h2>
              <NuxtLink
                :to="`/activities?customerId=${customer._id}`"
                class="text-blue-500 hover:underline"
              >
                Tümünü Gör →
              </NuxtLink>
            </div>

            <div class="space-y-4">
              <div
                v-for="activity in customerActivities.slice(0, 10)"
                :key="activity._id"
                class="border-l-4 pl-4 py-2"
                :class="getActivityBorderClass(activity.type)"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xl">{{ getActivityIcon(activity.type) }}</span>
                      <h3 class="font-semibold">{{ activity.subject }}</h3>
                    </div>
                    <p v-if="activity.description" class="text-sm text-gray-600 mb-2">
                      {{ activity.description }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ formatDateTime(activity.createdAt) }}
                      <span v-if="activity.createdBy"> • {{ activity.createdBy }}</span>
                    </p>
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
            </div>

            <div v-if="customerActivities.length === 0" class="text-center text-gray-500 py-8">
              Henüz aktivite bulunmuyor.
            </div>
          </div>

          <!-- Fırsatlar Tab -->
          <div v-if="activeTab === 'deals'">
            <h2 class="text-xl font-semibold mb-4">İlgili Fırsatlar</h2>
            <div class="space-y-3">
              <div
                v-for="deal in customerDeals"
                :key="deal._id"
                class="border rounded p-4 hover:bg-gray-50"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-semibold">{{ deal.title }}</h3>
                    <p class="text-gray-600">{{ formatCurrency(deal.value, deal.currency) }}</p>
                  </div>
                  <span
                    class="px-2 py-1 rounded text-xs"
                    :class="getStageClass(deal.stage)"
                  >
                    {{ getStageText(deal.stage) }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="customerDeals.length === 0" class="text-center text-gray-500 py-8">
              Henüz fırsat bulunmuyor.
            </div>
          </div>

          <!-- Görevler Tab -->
          <div v-if="activeTab === 'tasks'">
            <h2 class="text-xl font-semibold mb-4">İlgili Görevler</h2>
            <div class="space-y-3">
              <div
                v-for="task in customerTasks"
                :key="task._id"
                class="border rounded p-4 hover:bg-gray-50"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-semibold">{{ task.title }}</h3>
                    <p class="text-sm text-gray-600">{{ formatDateTime(task.dueDate) }}</p>
                  </div>
                  <span
                    class="px-2 py-1 rounded text-xs"
                    :class="getTaskStatusClass(task.status)"
                  >
                    {{ getTaskStatusText(task.status) }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="customerTasks.length === 0" class="text-center text-gray-500 py-8">
              Henüz görev bulunmuyor.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "nuxt/app";
import {ref} from "vue";

const route = useRoute()
const customerId = route.params.id as string
const activeTab = ref('activities')

const { data, pending, error } = await useFetch(`/api/customers/${customerId}`)
const { data: activitiesData } = await useFetch(`/api/activities?customerId=${customerId}`)
const { data: dealsData } = await useFetch(`/api/deals?customerId=${customerId}`)
const { data: tasksData } = await useFetch(`/api/tasks?customerId=${customerId}`)

const customer = computed(() => data.value?.data)
const customerActivities = computed(() => activitiesData.value?.data || [])
const customerDeals = computed(() => dealsData.value?.data || [])
const customerTasks = computed(() => tasksData.value?.data || [])

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatCurrency = (value: number, currency: string = 'TRY') => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
  }).format(value)
}

const getActivityIcon = (type: string) => {
  const icons = {
    call: '',
    email: '',
    meeting: '',
    note: '',
    task: '✅',
    deal: '',
  }
  return icons[type as keyof typeof icons] || ''
}

const getActivityBorderClass = (type: string) => {
  const classes = {
    call: 'border-blue-500',
    email: 'border-green-500',
    meeting: 'border-purple-500',
    note: 'border-yellow-500',
    task: 'border-orange-500',
    deal: 'border-pink-500',
  }
  return classes[type as keyof typeof classes] || 'border-gray-300'
}

const getOutcomeClass = (outcome: string) => {
  const classes = {
    successful: 'bg-green-100 text-green-800',
    unsuccessful: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    scheduled: 'bg-blue-100 text-blue-800',
  }
  return classes[outcome as keyof typeof classes] || ''
}

const getOutcomeText = (outcome: string) => {
  const texts = {
    successful: 'Başarılı',
    unsuccessful: 'Başarısız',
    pending: 'Beklemede',
    scheduled: 'Planlandı',
  }
  return texts[outcome as keyof typeof texts] || outcome
}

const getStatusClass = (status: string) => {
  const classes = {
    lead: 'bg-blue-100 text-blue-800',
    prospect: 'bg-yellow-100 text-yellow-800',
    customer: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
  }
  return classes[status as keyof typeof classes] || ''
}

const getStatusText = (status: string) => {
  const texts = {
    lead: 'Lead',
    prospect: 'Prospect',
    customer: 'Müşteri',
    inactive: 'Pasif',
  }
  return texts[status as keyof typeof texts] || status
}

const getStageClass = (stage: string) => {
  const classes = {
    lead: 'bg-gray-100 text-gray-800',
    qualified: 'bg-blue-100 text-blue-800',
    proposal: 'bg-purple-100 text-purple-800',
    negotiation: 'bg-yellow-100 text-yellow-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  }
  return classes[stage as keyof typeof classes] || ''
}

const getStageText = (stage: string) => {
  const texts = {
    lead: 'Lead',
    qualified: 'Kalifiye',
    proposal: 'Teklif',
    negotiation: 'Müzakere',
    won: 'Kazanıldı',
    lost: 'Kaybedildi',
  }
  return texts[stage as keyof typeof texts] || stage
}

const getTaskStatusClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }
  return classes[status as keyof typeof classes] || ''
}

const getTaskStatusText = (status: string) => {
  const texts = {
    pending: 'Bekliyor',
    'in-progress': 'Devam Ediyor',
    completed: 'Tamamlandı',
    cancelled: 'İptal',
  }
  return texts[status as keyof typeof texts] || status
}
</script>