<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-4">Arama Sonuçları</h1>

      <!-- Search Bar -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-4">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            v-model="searchQuery"
            @input="performSearch"
            type="text"
            placeholder="Ara..."
            class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Kategori</label>
            <select
              v-model="selectedType"
              @change="performAdvancedSearch"
              class="border p-2 rounded w-full"
            >
              <option value="">Tümü</option>
              <option value="customers">Müşteriler</option>
              <option value="deals">Fırsatlar</option>
              <option value="tasks">Görevler</option>
              <option value="activities">Aktiviteler</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Başlangıç Tarihi</label>
            <input
              v-model="dateFrom"
              @change="performAdvancedSearch"
              type="date"
              class="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Bitiş Tarihi</label>
            <input
              v-model="dateTo"
              @change="performAdvancedSearch"
              type="date"
              class="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Durum</label>
            <select
              v-model="selectedStatus"
              @change="performAdvancedSearch"
              class="border p-2 rounded w-full"
            >
              <option value="">Tümü</option>
              <option v-if="selectedType === 'customers'" value="lead">Lead</option>
              <option v-if="selectedType === 'customers'" value="customer">Müşteri</option>
              <option v-if="selectedType === 'deals'" value="lead">Lead</option>
              <option v-if="selectedType === 'deals'" value="won">Kazanıldı</option>
              <option v-if="selectedType === 'tasks'" value="pending">Bekliyor</option>
              <option v-if="selectedType === 'tasks'" value="completed">Tamamlandı</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-gray-500">Aranıyor...</p>
    </div>

    <!-- Results -->
    <div v-else-if="hasResults">
      <!-- Stats -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">
              "<span class="font-semibold">{{ searchQuery }}</span>" için
              <span class="font-semibold text-blue-600">{{ totalResults }}</span> sonuç bulundu
            </p>
          </div>
          <div class="flex gap-2">
            <button
              @click="exportResults"
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
            >
              📥 Dışa Aktar
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow-md mb-6">
        <div class="border-b">
          <div class="flex overflow-x-auto">
            <button
              @click="activeTab = 'all'"
              class="px-6 py-3 font-medium whitespace-nowrap"
              :class="activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'"
            >
              Tümü ({{ totalResults }})
            </button>
            <button
              v-if="results.customers?.length"
              @click="activeTab = 'customers'"
              class="px-6 py-3 font-medium whitespace-nowrap"
              :class="activeTab === 'customers' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'"
            >
              Müşteriler ({{ results.customers.length }})
            </button>
            <button
              v-if="results.deals?.length"
              @click="activeTab = 'deals'"
              class="px-6 py-3 font-medium whitespace-nowrap"
              :class="activeTab === 'deals' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'"
            >
              Fırsatlar ({{ results.deals.length }})
            </button>
            <button
              v-if="results.tasks?.length"
              @click="activeTab = 'tasks'"
              class="px-6 py-3 font-medium whitespace-nowrap"
              :class="activeTab === 'tasks' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'"
            >
              Görevler ({{ results.tasks.length }})
            </button>
            <button
              v-if="results.activities?.length"
              @click="activeTab = 'activities'"
              class="px-6 py-3 font-medium whitespace-nowrap"
              :class="activeTab === 'activities' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'"
            >
              Aktiviteler ({{ results.activities.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Results Lists -->
      <div class="space-y-4">
        <!-- Customers -->
        <div v-if="(activeTab === 'all' || activeTab === 'customers') && results.customers?.length">
          <h3 v-if="activeTab === 'all'" class="text-lg font-semibold mb-3">Müşteriler</h3>
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="divide-y">
              <NuxtLink
                v-for="customer in results.customers"
                :key="customer._id"
                :to="`/customers/${customer._id}`"
                class="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-lg">
                    {{ customer.firstName[0] }}{{ customer.lastName[0] }}
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-lg">
                      {{ customer.firstName }} {{ customer.lastName }}
                    </div>
                    <div class="text-sm text-gray-600">
                      {{ customer.company }} • {{ customer.email }}
                    </div>
                  </div>
                  <span
                    class="px-3 py-1 rounded text-sm"
                    :class="getStatusClass(customer.status)"
                  >
                    {{ getStatusText(customer.status) }}
                  </span>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Deals -->
        <div v-if="(activeTab === 'all' || activeTab === 'deals') && results.deals?.length">
          <h3 v-if="activeTab === 'all'" class="text-lg font-semibold mb-3">Fırsatlar</h3>
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="divide-y">
              <NuxtLink
                v-for="deal in results.deals"
                :key="deal._id"
                to="/deals"
                class="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4 flex-1">
                    <div class="text-3xl">💼</div>
                    <div class="flex-1">
                      <div class="font-semibold text-lg">{{ deal.title }}</div>
                      <div class="text-sm text-gray-600">
                        {{ deal.customer?.firstName }} {{ deal.customer?.lastName }} - {{ deal.customer?.company }}
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-semibold text-lg text-green-600">
                      {{ formatCurrency(deal.value, deal.currency) }}
                    </div>
                    <span
                      class="px-3 py-1 rounded text-sm inline-block mt-1"
                      :class="getStageClass(deal.stage)"
                    >
                      {{ getStageText(deal.stage) }}
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Tasks -->
        <div v-if="(activeTab === 'all' || activeTab === 'tasks') && results.tasks?.length">
          <h3 v-if="activeTab === 'all'" class="text-lg font-semibold mb-3">Görevler</h3>
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="divide-y">
              <NuxtLink
                v-for="task in results.tasks"
                :key="task._id"
                to="/tasks"
                class="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4 flex-1">
                    <div class="text-3xl">✅</div>
                    <div class="flex-1">
                      <div class="font-semibold">{{ task.title }}</div>
                      <div class="text-sm text-gray-600">
                        {{ task.customer?.firstName }} {{ task.customer?.lastName }}
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-600 mb-1">
                      {{ formatDate(task.dueDate) }}
                    </div>
                    <span
                      class="px-3 py-1 rounded text-sm"
                      :class="getTaskStatusClass(task.status)"
                    >
                      {{ getTaskStatusText(task.status) }}
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Activities -->
        <div v-if="(activeTab === 'all' || activeTab === 'activities') && results.activities?.length">
          <h3 v-if="activeTab === 'all'" class="text-lg font-semibold mb-3">Aktiviteler</h3>
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="divide-y">
              <NuxtLink
                v-for="activity in results.activities"
                :key="activity._id"
                to="/activities"
                class="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4 flex-1">
                    <div class="text-3xl">{{ getActivityIcon(activity.type) }}</div>
                    <div class="flex-1">
                      <div class="font-semibold">{{ activity.subject }}</div>
                      <div class="text-sm text-gray-600">
                        {{ activity.customer?.firstName }} {{ activity.customer?.lastName }} -
                        {{ activity.customer?.company }}
                      </div>
                    </div>
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ formatDate(activity.createdAt) }}
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else-if="searchQuery && !isLoading" class="text-center py-12">
      <div class="text-6xl mb-4">🔍</div>
      <h3 class="text-xl font-semibold mb-2">Sonuç bulunamadı</h3>
      <p class="text-gray-500">"{{ searchQuery }}" için sonuç bulunamadı</p>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-6xl mb-4">🔎</div>
      <h3 class="text-xl font-semibold mb-2">Arama yapın</h3>
      <p class="text-gray-500">Müşteriler, fırsatlar, görevler ve daha fazlasını arayın</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const searchQuery = ref((route.query.q as string) || '')
const selectedType = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const selectedStatus = ref('')
const activeTab = ref('all')
const isLoading = ref(false)
const results = ref<any>({})
const advancedResults = ref<any>([])

let debounceTimeout: any = null

const hasResults = computed(() => {
  if (selectedType.value) {
    return advancedResults.value.length > 0
  }
  return results.value.total > 0
})

const totalResults = computed(() => {
  if (selectedType.value) {
    return advancedResults.value.length
  }
  return results.value.total || 0
})

const performSearch = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }

  debounceTimeout = setTimeout(async () => {
    if (searchQuery.value.length < 2) {
      results.value = {}
      return
    }

    // Update URL
    router.push({ query: { q: searchQuery.value } })

    isLoading.value = true
    try {
      const response = await $fetch('/api/search/global', {
        params: { q: searchQuery.value, limit: 50 },
      })

      if (response.success) {
        results.value = response.data
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      isLoading.value = false
    }
  }, 500)
}

const performAdvancedSearch = async () => {
  if (!selectedType.value || searchQuery.value.length < 2) {
    advancedResults.value = []
    return
  }

  isLoading.value = true
  try {
    const params: any = {
      q: searchQuery.value,
      type: selectedType.value,
      limit: 100,
    }

    if (dateFrom.value) params.dateFrom = dateFrom.value
    if (dateTo.value) params.dateTo = dateTo.value
    if (selectedStatus.value) params.status = selectedStatus.value

    const response = await $fetch('/api/search/advanced', { params })

    if (response.success) {
      advancedResults.value = response.data
    }
  } catch (error) {
    console.error('Advanced search error:', error)
  } finally {
    isLoading.value = false
  }
}

const exportResults = async () => {
  try {
    let endpoint = ''
    const params = new URLSearchParams()
    params.append('format', 'excel')

    if (selectedType.value === 'customers') {
      endpoint = '/api/export/customers'
    } else if (selectedType.value === 'deals') {
      endpoint = '/api/export/deals'
    } else if (selectedType.value === 'tasks') {
      endpoint = '/api/export/tasks'
    } else if (selectedType.value === 'activities') {
      endpoint = '/api/export/activities'
    } else {
      alert('Lütfen bir kategori seçin')
      return
    }

    const response = await fetch(`${endpoint}?${params.toString()}`)
    const blob = await response.blob()

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arama-sonuclari-${Date.now()}.xlsx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Export error:', error)
    alert('Dışa aktarma sırasında bir hata oluştu')
  }
}

// Watch for type changes
watch(selectedType, () => {
  if (selectedType.value) {
    performAdvancedSearch()
  } else {
    advancedResults.value = []
  }
})

// Initial search if query exists
onMounted(() => {
  if (searchQuery.value) {
    performSearch()
  }
})

// Helper functions
const formatCurrency = (value: number, currency: string = 'TRY') => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getStatusClass = (status: string) => {
  const classes: any = {
    lead: 'bg-blue-100 text-blue-800',
    prospect: 'bg-yellow-100 text-yellow-800',
    customer: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
  }
  return classes[status] || ''
}

const getStatusText = (status: string) => {
  const texts: any = {
    lead: 'Lead',
    prospect: 'Prospect',
    customer: 'Müşteri',
    inactive: 'Pasif',
  }
  return texts[status] || status
}

const getStageClass = (stage: string) => {
  const classes: any = {
    lead: 'bg-gray-100 text-gray-800',
    qualified: 'bg-blue-100 text-blue-800',
    proposal: 'bg-purple-100 text-purple-800',
    negotiation: 'bg-yellow-100 text-yellow-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  }
  return classes[stage] || ''
}

const getStageText = (stage: string) => {
  const texts: any = {
    lead: 'Lead',
    qualified: 'Kalifiye',
    proposal: 'Teklif',
    negotiation: 'Müzakere',
    won: 'Kazanıldı',
    lost: 'Kaybedildi',
  }
  return texts[stage] || stage
}

const getTaskStatusClass = (status: string) => {
  const classes: any = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }
  return classes[status] || ''
}

const getTaskStatusText = (status: string) => {
  const texts: any = {
    pending: 'Bekliyor',
    'in-progress': 'Devam Ediyor',
    completed: 'Tamamlandı',
    cancelled: 'İptal',
  }
  return texts[status] || status
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
</script>