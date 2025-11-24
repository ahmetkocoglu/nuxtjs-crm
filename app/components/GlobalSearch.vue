<template>
  <div class="relative" ref="searchContainer">
    <!-- Search Input -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <input
        v-model="searchInput"
        @input="handleSearch"
        @focus="showResults = true"
        @keydown.esc="clearSearch"
        type="text"
        placeholder="Ara... (Ctrl+K)"
        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div v-if="searchInput" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <button @click="clearSearch" class="text-gray-400 hover:text-gray-600">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Search Results Dropdown -->
    <div
      v-if="showResults && (isSearching || searchResults)"
      class="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border z-50 max-h-[600px] overflow-y-auto"
    >
      <!-- Loading -->
      <div v-if="isSearching" class="p-4 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p class="text-sm text-gray-500 mt-2">Aranıyor...</p>
      </div>

      <!-- Results -->
      <div v-else-if="searchResults && searchResults.total > 0">
        <!-- Customers -->
        <div v-if="searchResults.customers.length > 0" class="border-b">
          <div class="px-4 py-2 bg-gray-50 font-semibold text-sm text-gray-700">
            Müşteriler ({{ searchResults.customers.length }})
          </div>
          <NuxtLink
            v-for="customer in searchResults.customers"
            :key="customer._id"
            :to="`/customers/${customer._id}`"
            @click="clearSearch"
            class="block px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                {{ customer.firstName[0] }}{{ customer.lastName[0] }}
              </div>
              <div class="flex-1">
                <div class="font-medium">{{ customer.firstName }} {{ customer.lastName }}</div>
                <div class="text-sm text-gray-600">{{ customer.company || customer.email }}</div>
              </div>
              <span
                class="px-2 py-1 rounded text-xs"
                :class="getStatusClass(customer.status)"
              >
                {{ getStatusText(customer.status) }}
              </span>
            </div>
          </NuxtLink>
        </div>

        <!-- Deals -->
        <div v-if="searchResults.deals.length > 0" class="border-b">
          <div class="px-4 py-2 bg-gray-50 font-semibold text-sm text-gray-700">
            Fırsatlar ({{ searchResults.deals.length }})
          </div>
          <NuxtLink
            v-for="deal in searchResults.deals"
            :key="deal._id"
            to="/deals"
            @click="clearSearch"
            class="block px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="font-medium">💼 {{ deal.title }}</div>
                <div class="text-sm text-gray-600">
                  {{ deal.customer?.firstName }} {{ deal.customer?.lastName }} - {{ deal.customer?.company }}
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-green-600">{{ formatCurrency(deal.value, deal.currency) }}</div>
                <span
                  class="px-2 py-1 rounded text-xs"
                  :class="getStageClass(deal.stage)"
                >
                  {{ getStageText(deal.stage) }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Tasks -->
        <div v-if="searchResults.tasks.length > 0" class="border-b">
          <div class="px-4 py-2 bg-gray-50 font-semibold text-sm text-gray-700">
            Görevler ({{ searchResults.tasks.length }})
          </div>
          <NuxtLink
            v-for="task in searchResults.tasks"
            :key="task._id"
            to="/tasks"
            @click="clearSearch"
            class="block px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="font-medium">✅ {{ task.title }}</div>
                <div class="text-sm text-gray-600">
                  {{ task.customer?.firstName }} {{ task.customer?.lastName }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-600">{{ formatDate(task.dueDate) }}</div>
                <span
                  class="px-2 py-1 rounded text-xs"
                  :class="getTaskStatusClass(task.status)"
                >
                  {{ getTaskStatusText(task.status) }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Activities -->
        <div v-if="searchResults.activities.length > 0" class="border-b">
          <div class="px-4 py-2 bg-gray-50 font-semibold text-sm text-gray-700">
            Aktiviteler ({{ searchResults.activities.length }})
          </div>
          <NuxtLink
            v-for="activity in searchResults.activities"
            :key="activity._id"
            to="/activities"
            @click="clearSearch"
            class="block px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="text-2xl">{{ getActivityIcon(activity.type) }}</div>
              <div class="flex-1">
                <div class="font-medium">{{ activity.subject }}</div>
                <div class="text-sm text-gray-600">
                  {{ activity.customer?.firstName }} {{ activity.customer?.lastName }}
                </div>
              </div>
              <div class="text-sm text-gray-500">
                {{ formatDate(activity.createdAt) }}
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Emails -->
        <div v-if="searchResults.emails.length > 0" class="border-b">
          <div class="px-4 py-2 bg-gray-50 font-semibold text-sm text-gray-700">
            E-postalar ({{ searchResults.emails.length }})
          </div>
          <NuxtLink
            v-for="email in searchResults.emails"
            :key="email._id"
            to="/emails"
            @click="clearSearch"
            class="block px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="text-2xl">✉️</div>
              <div class="flex-1">
                <div class="font-medium">{{ email.subject }}</div>
                <div class="text-sm text-gray-600">
                  {{ email.customer?.firstName }} {{ email.customer?.lastName }}
                </div>
              </div>
              <span
                class="px-2 py-1 rounded text-xs"
                :class="getEmailStatusClass(email.status)"
              >
                {{ getEmailStatusText(email.status) }}
              </span>
            </div>
          </NuxtLink>
        </div>

        <!-- View All Results -->
        <div class="px-4 py-3 bg-gray-50">
          <NuxtLink
            :to="`/search?q=${searchInput}`"
            @click="clearSearch"
            class="block text-center text-sm text-blue-500 hover:text-blue-700 font-medium"
          >
            Tüm Sonuçları Gör ({{ searchResults.total }}) →
          </NuxtLink>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="searchInput.length >= 2" class="p-8 text-center">
        <div class="text-4xl mb-2">🔍</div>
        <p class="text-gray-500">Sonuç bulunamadı</p>
        <p class="text-sm text-gray-400 mt-1">"{{ searchInput }}" için sonuç yok</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const searchInput = ref('')
const searchResults = ref<any>(null)
const isSearching = ref(false)
const showResults = ref(false)
const searchContainer = ref<HTMLElement | null>(null)

let debounceTimeout: any = null

const handleSearch = () => {
  const term = searchInput.value

  if (term.length < 2) {
    searchResults.value = null
    showResults.value = false
    return
  }

  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }

  debounceTimeout = setTimeout(async () => {
    isSearching.value = true
    try {
      const response = await $fetch('/api/search/global', {
        params: { q: term, limit: 5 },
      })

      if (response.success) {
        searchResults.value = response.data
        showResults.value = true
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      isSearching.value = false
    }
  }, 300)
}

const clearSearch = () => {
  searchInput.value = ''
  searchResults.value = null
  showResults.value = false
}

// Keyboard shortcut (Ctrl+K / Cmd+K)
onMounted(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      const input = searchContainer.value?.querySelector('input')
      input?.focus()
    }
  }

  // Click outside to close
  const handleClickOutside = (e: MouseEvent) => {
    if (searchContainer.value && !searchContainer.value.contains(e.target as Node)) {
      showResults.value = false
    }
  }

  document.addEventListener('keydown', handleKeyPress)
  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyPress)
    document.removeEventListener('click', handleClickOutside)
  })
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
    day: 'numeric',
    month: 'short',
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

const getEmailStatusClass = (status: string) => {
  const classes: any = {
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    scheduled: 'bg-blue-100 text-blue-800',
    draft: 'bg-gray-100 text-gray-800',
  }
  return classes[status] || ''
}

const getEmailStatusText = (status: string) => {
  const texts: any = {
    sent: 'Gönderildi',
    failed: 'Başarısız',
    scheduled: 'Planlandı',
    draft: 'Taslak',
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