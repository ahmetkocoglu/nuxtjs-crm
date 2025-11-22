<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Aktivite Geçmişi</h1>
      <button
        @click="showAddForm = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Yeni Aktivite Ekle
      </button>
    </div>

    <!-- İstatistikler -->
    <div class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow-md text-center">
        <div class="text-2xl mb-1"></div>
        <p class="text-2xl font-bold">{{ getStatByType('call') }}</p>
        <p class="text-sm text-gray-600">Görüşme</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-md text-center">
        <div class="text-2xl mb-1"></div>
        <p class="text-2xl font-bold">{{ getStatByType('email') }}</p>
        <p class="text-sm text-gray-600">E-posta</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-md text-center">
        <div class="text-2xl mb-1"></div>
        <p class="text-2xl font-bold">{{ getStatByType('meeting') }}</p>
        <p class="text-sm text-gray-600">Toplantı</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-md text-center">
        <div class="text-2xl mb-1"></div>
        <p class="text-2xl font-bold">{{ getStatByType('note') }}</p>
        <p class="text-sm text-gray-600">Not</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-md text-center">
        <div class="text-2xl mb-1">✅</div>
        <p class="text-2xl font-bold">{{ getStatByType('task') }}</p>
        <p class="text-sm text-gray-600">Görev</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-md text-center">
        <div class="text-2xl mb-1"></div>
        <p class="text-2xl font-bold">{{ getStatByType('deal') }}</p>
        <p class="text-sm text-gray-600">Fırsat</p>
      </div>
    </div>

    <!-- Aktivite Ekleme/Düzenleme Formu -->
    <div v-if="showAddForm" class="bg-white p-6 rounded shadow-md mb-6">
      <h2 class="text-xl font-semibold mb-4">{{ editingActivity ? 'Aktiviteyi Düzenle' : 'Yeni Aktivite' }}</h2>
      <form @submit.prevent="saveActivity">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Aktivite Tipi *</label>
            <select
              v-model="activityForm.type"
              required
              class="border p-2 rounded w-full"
            >
              <option value="call"> Telefon Görüşmesi</option>
              <option value="email"> E-posta</option>
              <option value="meeting"> Toplantı</option>
              <option value="note"> Not</option>
              <option value="task">✅ Görev</option>
              <option value="deal"> Fırsat</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Müşteri *</label>
            <select
              v-model="activityForm.customer"
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

          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Konu *</label>
            <input
              v-model="activityForm.subject"
              required
              class="border p-2 rounded w-full"
              placeholder="Aktivite konusu"
            />
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Açıklama</label>
            <textarea
              v-model="activityForm.description"
              class="border p-2 rounded w-full"
              rows="4"
              placeholder="Detaylı açıklama..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Süre (dakika)</label>
            <input
              v-model.number="activityForm.duration"
              type="number"
              min="0"
              class="border p-2 rounded w-full"
              placeholder="Aktivite süresi"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Sonuç</label>
            <select v-model="activityForm.outcome" class="border p-2 rounded w-full">
              <option value="">Seçin</option>
              <option value="successful">Başarılı</option>
              <option value="unsuccessful">Başarısız</option>
              <option value="pending">Beklemede</option>
              <option value="scheduled">Planlandı</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">İlgili Fırsat</label>
            <select v-model="activityForm.deal" class="border p-2 rounded w-full">
              <option value="">Seçin</option>
              <option
                v-for="deal in deals"
                :key="deal._id"
                :value="deal._id"
              >
                {{ deal.title }} - {{ formatCurrency(deal.value) }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">İlgili Görev</label>
            <select v-model="activityForm.task" class="border p-2 rounded w-full">
              <option value="">Seçin</option>
              <option
                v-for="task in tasks"
                :key="task._id"
                :value="task._id"
              >
                {{ task.title }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Planlanma Tarihi</label>
            <input
              v-model="activityForm.scheduledDate"
              type="datetime-local"
              class="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Tamamlanma Tarihi</label>
            <input
              v-model="activityForm.completedDate"
              type="datetime-local"
              class="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Oluşturan</label>
            <input
              v-model="activityForm.createdBy"
              class="border p-2 rounded w-full"
              placeholder="İsim"
            />
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            {{ editingActivity ? 'Güncelle' : 'Kaydet' }}
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
          <label class="block text-sm font-medium mb-1">Aktivite Tipi</label>
          <select v-model="filterType" class="border p-2 rounded w-full">
            <option value="">Tümü</option>
            <option value="call">Telefon Görüşmesi</option>
            <option value="email">E-posta</option>
            <option value="meeting">Toplantı</option>
            <option value="note">Not</option>
            <option value="task">Görev</option>
            <option value="deal">Fırsat</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Müşteri</label>
          <select v-model="filterCustomer" class="border p-2 rounded w-full">
            <option value="">Tümü</option>
            <option
              v-for="customer in customers"
              :key="customer._id"
              :value="customer._id"
            >
              {{ customer.firstName }} {{ customer.lastName }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Sonuç</label>
          <select v-model="filterOutcome" class="border p-2 rounded w-full">
            <option value="">Tümü</option>
            <option value="successful">Başarılı</option>
            <option value="unsuccessful">Başarısız</option>
            <option value="pending">Beklemede</option>
            <option value="scheduled">Planlandı</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Aktivite Listesi - Timeline -->
    <div v-if="pending" class="text-center">Yükleniyor...</div>
    <div v-else-if="error" class="text-red-500">Hata: {{ error.message }}</div>
    <div v-else class="space-y-4">
      <div
        v-for="activity in filteredActivities"
        :key="activity._id"
        class="bg-white rounded-lg shadow-md p-6 border-l-4"
        :class="getActivityBorderClass(activity.type)"
      >
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center gap-3">
            <div class="text-3xl">{{ getActivityIcon(activity.type) }}</div>
            <div>
              <h3 class="font-semibold text-lg">{{ activity.subject }}</h3>
              <div class="flex items-center gap-3 text-sm text-gray-600 mt-1">
                <span>{{ activity.customer?.firstName }} {{ activity.customer?.lastName }}</span>
                <span>•</span>
                <span>{{ activity.customer?.company }}</span>
                <span>•</span>
                <span>{{ formatDateTime(activity.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span
              v-if="activity.outcome"
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="getOutcomeClass(activity.outcome)"
            >
              {{ getOutcomeText(activity.outcome) }}
            </span>
            <button
              @click="editActivity(activity)"
              class="text-blue-500 hover:text-blue-700 text-sm"
            >
              Düzenle
            </button>
            <button
              @click="deleteActivity(activity._id)"
              class="text-red-500 hover:text-red-700 text-sm"
            >
              Sil
            </button>
          </div>
        </div>

        <p v-if="activity.description" class="text-gray-700 mb-3 whitespace-pre-line">
          {{ activity.description }}
        </p>

        <div class="flex flex-wrap gap-4 text-sm text-gray-600">
          <div v-if="activity.duration" class="flex items-center gap-1">
            <span class="font-medium">Süre:</span>
            <span>{{ activity.duration }} dakika</span>
          </div>

          <div v-if="activity.scheduledDate" class="flex items-center gap-1">
            <span class="font-medium">Planlandı:</span>
            <span>{{ formatDateTime(activity.scheduledDate) }}</span>
          </div>

          <div v-if="activity.completedDate" class="flex items-center gap-1">
            <span class="font-medium">Tamamlandı:</span>
            <span>{{ formatDateTime(activity.completedDate) }}</span>
          </div>

          <div v-if="activity.createdBy" class="flex items-center gap-1">
            <span class="font-medium">Oluşturan:</span>
            <span>{{ activity.createdBy }}</span>
          </div>
        </div>

        <div v-if="activity.deal || activity.task" class="mt-3 pt-3 border-t flex gap-3">
          <div v-if="activity.deal" class="bg-purple-50 px-3 py-2 rounded text-sm">
            <span class="font-medium">Fırsat:</span> {{ activity.deal.title }}
          </div>
          <div v-if="activity.task" class="bg-blue-50 px-3 py-2 rounded text-sm">
            <span class="font-medium">Görev:</span> {{ activity.task.title }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="!pending && filteredActivities.length === 0" class="text-center text-gray-500 mt-8">
      Henüz aktivite bulunmuyor.
    </div>
  </div>
</template>

<script setup lang="ts">
const showAddForm = ref(false)
const editingActivity = ref<any>(null)
const filterType = ref('')
const filterCustomer = ref('')
const filterOutcome = ref('')

const activityForm = ref({
  type: 'call',
  customer: '',
  subject: '',
  description: '',
  duration: 0,
  outcome: '',
  deal: '',
  task: '',
  scheduledDate: '',
  completedDate: '',
  createdBy: '',
})

const { data, pending, error, refresh } = await useFetch('/api/activities')
const { data: statsData } = await useFetch('/api/activities/stats')
const { data: customersData } = await useFetch('/api/customers')
const { data: dealsData } = await useFetch('/api/deals')
const { data: tasksData } = await useFetch('/api/tasks')

const activities = computed(() => data.value?.data || [])
const stats = computed(() => statsData.value?.data || { total: 0, byType: [] })
const customers = computed(() => customersData.value?.data || [])
const deals = computed(() => dealsData.value?.data || [])
const tasks = computed(() => tasksData.value?.data || [])

const filteredActivities = computed(() => {
  return activities.value.filter((activity: any) => {
    if (filterType.value && activity.type !== filterType.value) return false
    if (filterCustomer.value && activity.customer._id !== filterCustomer.value) return false
    if (filterOutcome.value && activity.outcome !== filterOutcome.value) return false
    return true
  })
})

const getStatByType = (type: string) => {
  const stat = stats.value.byType.find((s: any) => s._id === type)
  return stat ? stat.count : 0
}

const saveActivity = async () => {
  try {
    const payload = { ...activityForm.value }

    // Boş alanları temizle
    if (!payload.deal) delete payload.deal
    if (!payload.task) delete payload.task
    if (!payload.duration) delete payload.duration
    if (!payload.outcome) delete payload.outcome
    if (!payload.scheduledDate) delete payload.scheduledDate
    if (!payload.completedDate) delete payload.completedDate
    if (!payload.createdBy) delete payload.createdBy

    if (editingActivity.value) {
      await $fetch(`/api/activities/${editingActivity.value._id}`, {
        method: 'PUT',
        body: payload,
      })
    } else {
      await $fetch('/api/activities', {
        method: 'POST',
        body: payload,
      })
    }

    cancelForm()
    refresh()
  } catch (err) {
    console.error('Aktivite kaydedilirken hata:', err)
    alert('Aktivite kaydedilirken bir hata oluştu')
  }
}

const editActivity = (activity: any) => {
  editingActivity.value = activity
  activityForm.value = {
    type: activity.type,
    customer: activity.customer._id,
    subject: activity.subject,
    description: activity.description || '',
    duration: activity.duration || 0,
    outcome: activity.outcome || '',
    deal: activity.deal?._id || '',
    task: activity.task?._id || '',
    scheduledDate: activity.scheduledDate ? new Date(activity.scheduledDate).toISOString().slice(0, 16) : '',
    completedDate: activity.completedDate ? new Date(activity.completedDate).toISOString().slice(0, 16) : '',
    createdBy: activity.createdBy || '',
  }
  showAddForm.value = true
}

const deleteActivity = async (id: string) => {
  if (!confirm('Bu aktiviteyi silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(`/api/activities/${id}`, { method: 'DELETE' })
    refresh()
  } catch (err) {
    console.error('Aktivite silinirken hata:', err)
    alert('Aktivite silinirken bir hata oluştu')
  }
}

const cancelForm = () => {
  showAddForm.value = false
  editingActivity.value = null
  activityForm.value = {
    type: 'call',
    customer: '',
    subject: '',
    description: '',
    duration: 0,
    outcome: '',
    deal: '',
    task: '',
    scheduledDate: '',
    completedDate: '',
    createdBy: '',
  }
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
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
</script>