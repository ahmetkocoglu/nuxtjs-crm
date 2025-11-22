<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Satış Fırsatları</h1>
      <button
        @click="showAddForm = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Yeni Fırsat Ekle
      </button>
    </div>

    <!-- İstatistikler -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow-md">
        <h3 class="text-gray-500 text-sm font-medium mb-1">Toplam Fırsatlar</h3>
        <p class="text-2xl font-bold">{{ deals.length }}</p>
      </div>
      <div class="bg-green-50 p-4 rounded-lg shadow-md">
        <h3 class="text-green-700 text-sm font-medium mb-1">Kazanılan</h3>
        <p class="text-2xl font-bold text-green-700">{{ formatCurrency(wonValue) }}</p>
      </div>
      <div class="bg-blue-50 p-4 rounded-lg shadow-md">
        <h3 class="text-blue-700 text-sm font-medium mb-1">Potansiyel</h3>
        <p class="text-2xl font-bold text-blue-700">{{ formatCurrency(pipelineValue) }}</p>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg shadow-md">
        <h3 class="text-purple-700 text-sm font-medium mb-1">Başarı Oranı</h3>
        <p class="text-2xl font-bold text-purple-700">{{ winRate }}%</p>
      </div>
    </div>

    <!-- Fırsat Ekleme/Düzenleme Formu -->
    <div v-if="showAddForm" class="bg-white p-6 rounded shadow-md mb-6">
      <h2 class="text-xl font-semibold mb-4">{{ editingDeal ? 'Fırsatı Düzenle' : 'Yeni Fırsat' }}</h2>
      <form @submit.prevent="saveDeal">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Başlık *</label>
            <input
              v-model="dealForm.title"
              required
              class="border p-2 rounded w-full"
              placeholder="Fırsat başlığı"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Müşteri *</label>
            <select
              v-model="dealForm.customer"
              required
              class="border p-2 rounded w-full"
            >
              <option value="">Müşteri Seçin</option>
              <option
                v-for="customer in customers"
                :key="customer._id"
                :value="customer._id"
              >
                {{ customer.firstName }} {{ customer.lastName }} - {{ customer.company }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Tutar *</label>
            <input
              v-model.number="dealForm.value"
              type="number"
              required
              min="0"
              step="0.01"
              class="border p-2 rounded w-full"
              placeholder="0.00"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Para Birimi</label>
            <select v-model="dealForm.currency" class="border p-2 rounded w-full">
              <option value="TRY">TRY</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Aşama</label>
            <select v-model="dealForm.stage" class="border p-2 rounded w-full">
              <option value="lead">Lead</option>
              <option value="qualified">Kalifiye</option>
              <option value="proposal">Teklif</option>
              <option value="negotiation">Müzakere</option>
              <option value="won">Kazanıldı</option>
              <option value="lost">Kaybedildi</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Olasılık (%)</label>
            <input
              v-model.number="dealForm.probability"
              type="number"
              min="0"
              max="100"
              class="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Beklenen Kapanış Tarihi</label>
            <input
              v-model="dealForm.expectedCloseDate"
              type="date"
              class="border p-2 rounded w-full"
            />
          </div>

          <div v-if="dealForm.stage === 'lost'">
            <label class="block text-sm font-medium mb-1">Kayıp Nedeni</label>
            <input
              v-model="dealForm.lostReason"
              class="border p-2 rounded w-full"
              placeholder="Neden kaybedildi?"
            />
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Açıklama</label>
            <textarea
              v-model="dealForm.description"
              class="border p-2 rounded w-full"
              rows="2"
              placeholder="Fırsat açıklaması"
            ></textarea>
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Notlar</label>
            <textarea
              v-model="dealForm.notes"
              class="border p-2 rounded w-full"
              rows="2"
              placeholder="Ek notlar"
            ></textarea>
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            {{ editingDeal ? 'Güncelle' : 'Kaydet' }}
          </button>
          <button
            type="button"
            @click="cancelForm"
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            İptal
          </button>
        </div>
      </form>
    </div>

    <!-- Filtreler -->
    <div class="bg-white p-4 rounded shadow-md mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Aşama</label>
          <select v-model="filterStage" class="border p-2 rounded w-full">
            <option value="">Tümü</option>
            <option value="lead">Lead</option>
            <option value="qualified">Kalifiye</option>
            <option value="proposal">Teklif</option>
            <option value="negotiation">Müzakere</option>
            <option value="won">Kazanıldı</option>
            <option value="lost">Kaybedildi</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Fırsat Listesi -->
    <div v-if="pending" class="text-center">Yükleniyor...</div>
    <div v-else-if="error" class="text-red-500">Hata: {{ error.message }}</div>
    <div v-else class="bg-white rounded shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-100">
        <tr>
          <th class="p-3 text-left">Başlık</th>
          <th class="p-3 text-left">Müşteri</th>
          <th class="p-3 text-left">Tutar</th>
          <th class="p-3 text-left">Aşama</th>
          <th class="p-3 text-left">Olasılık</th>
          <th class="p-3 text-left">Beklenen Kapanış</th>
          <th class="p-3 text-left">İşlemler</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="deal in filteredDeals" :key="deal._id" class="border-t hover:bg-gray-50">
          <td class="p-3 font-medium">{{ deal.title }}</td>
          <td class="p-3">
            <div>{{ deal.customer?.firstName }} {{ deal.customer?.lastName }}</div>
            <div class="text-sm text-gray-500">{{ deal.customer?.company }}</div>
          </td>
          <td class="p-3 font-semibold">{{ formatCurrency(deal.value, deal.currency) }}</td>
          <td class="p-3">
              <span
                class="px-2 py-1 rounded text-sm"
                :class="getStageClass(deal.stage)"
              >
                {{ getStageText(deal.stage) }}
              </span>
          </td>
          <td class="p-3">
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-500 h-2 rounded-full"
                  :style="{ width: deal.probability + '%' }"
                ></div>
              </div>
              <span class="text-sm">{{ deal.probability }}%</span>
            </div>
          </td>
          <td class="p-3 text-sm">
            {{ deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : '-' }}
          </td>
          <td class="p-3">
            <div class="flex gap-2">
              <button
                @click="editDeal(deal)"
                class="text-blue-500 hover:text-blue-700 text-sm"
              >
                Düzenle
              </button>
              <button
                @click="deleteDeal(deal._id)"
                class="text-red-500 hover:text-red-700 text-sm"
              >
                Sil
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!pending && filteredDeals.length === 0" class="text-center text-gray-500 mt-8">
      Henüz fırsat bulunmuyor.
    </div>
  </div>
</template>

<script setup lang="ts">
const showAddForm = ref(false)
const editingDeal = ref<any>(null)
const filterStage = ref('')

const dealForm = ref({
  title: '',
  customer: '',
  value: 0,
  currency: 'TRY',
  stage: 'lead',
  probability: 10,
  expectedCloseDate: '',
  description: '',
  notes: '',
  lostReason: '',
})

const { data, pending, error, refresh } = await useFetch('/api/deals')
const { data: customersData } = await useFetch('/api/customers')

const deals = computed(() => data.value?.data || [])
const customers = computed(() => customersData.value?.data || [])

const filteredDeals = computed(() => {
  return deals.value.filter((deal: any) => {
    if (filterStage.value && deal.stage !== filterStage.value) return false
    return true
  })
})

const wonValue = computed(() => {
  return deals.value
    .filter((d: any) => d.stage === 'won')
    .reduce((sum: number, d: any) => sum + d.value, 0)
})

const pipelineValue = computed(() => {
  return deals.value
    .filter((d: any) => !['won', 'lost'].includes(d.stage))
    .reduce((sum: number, d: any) => sum + (d.value * d.probability / 100), 0)
})

const winRate = computed(() => {
  const closed = deals.value.filter((d: any) => ['won', 'lost'].includes(d.stage))
  const won = deals.value.filter((d: any) => d.stage === 'won')
  return closed.length > 0 ? Math.round((won.length / closed.length) * 100) : 0
})

const saveDeal = async () => {
  try {
    if (editingDeal.value) {
      await $fetch(`/api/deals/${editingDeal.value._id}`, {
        method: 'PUT',
        body: dealForm.value,
      })
    } else {
      await $fetch('/api/deals', {
        method: 'POST',
        body: dealForm.value,
      })
    }

    cancelForm()
    refresh()
  } catch (err) {
    console.error('Fırsat kaydedilirken hata:', err)
    alert('Fırsat kaydedilirken bir hata oluştu')
  }
}

const editDeal = (deal: any) => {
  editingDeal.value = deal
  dealForm.value = {
    title: deal.title,
    customer: deal.customer._id,
    value: deal.value,
    currency: deal.currency,
    stage: deal.stage,
    probability: deal.probability,
    expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : '',
    description: deal.description || '',
    notes: deal.notes || '',
    lostReason: deal.lostReason || '',
  }
  showAddForm.value = true
}

const deleteDeal = async (id: string) => {
  if (!confirm('Bu fırsatı silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(`/api/deals/${id}`, { method: 'DELETE' })
    refresh()
  } catch (err) {
    console.error('Fırsat silinirken hata:', err)
    alert('Fırsat silinirken bir hata oluştu')
  }
}

const cancelForm = () => {
  showAddForm.value = false
  editingDeal.value = null
  dealForm.value = {
    title: '',
    customer: '',
    value: 0,
    currency: 'TRY',
    stage: 'lead',
    probability: 10,
    expectedCloseDate: '',
    description: '',
    notes: '',
    lostReason: '',
  }
}

const formatCurrency = (value: number, currency: string = 'TRY') => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
  }).format(value)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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
</script>