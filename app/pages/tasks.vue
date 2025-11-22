<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Görev Yönetimi</h1>
      <button
        @click="showAddForm = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Yeni Görev Ekle
      </button>
    </div>

    <!-- Görev Ekleme/Düzenleme Formu -->
    <div v-if="showAddForm" class="bg-white p-6 rounded shadow-md mb-6">
      <h2 class="text-xl font-semibold mb-4">{{ editingTask ? 'Görevi Düzenle' : 'Yeni Görev' }}</h2>
      <form @submit.prevent="saveTask">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Başlık *</label>
            <input
              v-model="taskForm.title"
              required
              class="border p-2 rounded w-full"
              placeholder="Görev başlığı"
            />
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Açıklama</label>
            <textarea
              v-model="taskForm.description"
              class="border p-2 rounded w-full"
              rows="3"
              placeholder="Görev açıklaması"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Müşteri *</label>
            <select
              v-model="taskForm.customer"
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
            <label class="block text-sm font-medium mb-1">Son Tarih *</label>
            <input
              v-model="taskForm.dueDate"
              type="datetime-local"
              required
              class="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Öncelik</label>
            <select v-model="taskForm.priority" class="border p-2 rounded w-full">
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
              <option value="urgent">Acil</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Durum</label>
            <select v-model="taskForm.status" class="border p-2 rounded w-full">
              <option value="pending">Bekliyor</option>
              <option value="in-progress">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Atanan Kişi</label>
            <input
              v-model="taskForm.assignedTo"
              class="border p-2 rounded w-full"
              placeholder="İsim"
            />
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            {{ editingTask ? 'Güncelle' : 'Kaydet' }}
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
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Durum</label>
          <select v-model="filterStatus" class="border p-2 rounded w-full">
            <option value="">Tümü</option>
            <option value="pending">Bekliyor</option>
            <option value="in-progress">Devam Ediyor</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">İptal Edildi</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Öncelik</label>
          <select v-model="filterPriority" class="border p-2 rounded w-full">
            <option value="">Tümü</option>
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
            <option value="urgent">Acil</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Görev Listesi -->
    <div v-if="pending" class="text-center">Yükleniyor...</div>
    <div v-else-if="error" class="text-red-500">Hata: {{ error.message }}</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="task in filteredTasks"
        :key="task._id"
        class="bg-white rounded-lg shadow-md p-4 border-l-4"
        :class="getPriorityBorderClass(task.priority)"
      >
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-semibold text-lg">{{ task.title }}</h3>
          <span
            class="px-2 py-1 rounded text-xs font-medium"
            :class="getStatusClass(task.status)"
          >
            {{ getStatusText(task.status) }}
          </span>
        </div>

        <p v-if="task.description" class="text-gray-600 text-sm mb-3">
          {{ task.description }}
        </p>

        <div class="space-y-2 text-sm">
          <div class="flex items-center text-gray-700">
            <span class="font-medium mr-2">Müşteri:</span>
            <span>{{ task.customer?.firstName }} {{ task.customer?.lastName }}</span>
          </div>

          <div class="flex items-center text-gray-700">
            <span class="font-medium mr-2">Şirket:</span>
            <span>{{ task.customer?.company }}</span>
          </div>

          <div class="flex items-center">
            <span class="font-medium mr-2">Son Tarih:</span>
            <span :class="isOverdue(task.dueDate, task.status) ? 'text-red-600 font-semibold' : ''">
              {{ formatDate(task.dueDate) }}
            </span>
          </div>

          <div class="flex items-center">
            <span class="font-medium mr-2">Öncelik:</span>
            <span
              class="px-2 py-0.5 rounded text-xs"
              :class="getPriorityClass(task.priority)"
            >
              {{ getPriorityText(task.priority) }}
            </span>
          </div>

          <div v-if="task.assignedTo" class="flex items-center text-gray-700">
            <span class="font-medium mr-2">Atanan:</span>
            <span>{{ task.assignedTo }}</span>
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button
            @click="editTask(task)"
            class="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Düzenle
          </button>
          <button
            v-if="task.status !== 'completed'"
            @click="completeTask(task._id)"
            class="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
          >
            Tamamla
          </button>
          <button
            @click="deleteTask(task._id)"
            class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Sil
          </button>
        </div>
      </div>
    </div>

    <div v-if="!pending && filteredTasks.length === 0" class="text-center text-gray-500 mt-8">
      Henüz görev bulunmuyor.
    </div>
  </div>
</template>

<script setup lang="ts">
const showAddForm = ref(false)
const editingTask = ref<any>(null)
const filterStatus = ref('')
const filterPriority = ref('')

const taskForm = ref({
  title: '',
  description: '',
  customer: '',
  dueDate: '',
  priority: 'medium',
  status: 'pending',
  assignedTo: '',
})

// Görevleri ve müşterileri getir
const { data, pending, error, refresh } = await useFetch('/api/tasks')
const { data: customersData } = await useFetch('/api/customers')

const tasks = computed(() => data.value?.data || [])
const customers = computed(() => customersData.value?.data || [])

// Filtrelenmiş görevler
const filteredTasks = computed(() => {
  return tasks.value.filter((task: any) => {
    if (filterStatus.value && task.status !== filterStatus.value) return false
    if (filterPriority.value && task.priority !== filterPriority.value) return false
    return true
  })
})

const saveTask = async () => {
  try {
    if (editingTask.value) {
      await $fetch(`/api/tasks/${editingTask.value._id}`, {
        method: 'PUT',
        body: taskForm.value,
      })
    } else {
      await $fetch('/api/tasks', {
        method: 'POST',
        body: taskForm.value,
      })
    }

    cancelForm()
    refresh()
  } catch (err) {
    console.error('Görev kaydedilirken hata:', err)
    alert('Görev kaydedilirken bir hata oluştu')
  }
}

const editTask = (task: any) => {
  editingTask.value = task
  taskForm.value = {
    title: task.title,
    description: task.description || '',
    customer: task.customer._id,
    dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
    priority: task.priority,
    status: task.status,
    assignedTo: task.assignedTo || '',
  }
  showAddForm.value = true
}

const completeTask = async (id: string) => {
  try {
    await $fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      body: { status: 'completed' },
    })
    refresh()
  } catch (err) {
    console.error('Görev tamamlanırken hata:', err)
    alert('Görev tamamlanırken bir hata oluştu')
  }
}

const deleteTask = async (id: string) => {
  if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    refresh()
  } catch (err) {
    console.error('Görev silinirken hata:', err)
    alert('Görev silinirken bir hata oluştu')
  }
}

const cancelForm = () => {
  showAddForm.value = false
  editingTask.value = null
  taskForm.value = {
    title: '',
    description: '',
    customer: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: '',
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const isOverdue = (dueDate: string, status: string) => {
  if (status === 'completed' || status === 'cancelled') return false
  return new Date(dueDate) < new Date()
}

const getStatusClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }
  return classes[status as keyof typeof classes] || ''
}

const getStatusText = (status: string) => {
  const texts = {
    pending: 'Bekliyor',
    'in-progress': 'Devam Ediyor',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
  }
  return texts[status as keyof typeof texts] || status
}

const getPriorityClass = (priority: string) => {
  const classes = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  }
  return classes[priority as keyof typeof classes] || ''
}

const getPriorityBorderClass = (priority: string) => {
  const classes = {
    low: 'border-gray-300',
    medium: 'border-blue-500',
    high: 'border-orange-500',
    urgent: 'border-red-500',
  }
  return classes[priority as keyof typeof classes] || ''
}

const getPriorityText = (priority: string) => {
  const texts = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek',
    urgent: 'Acil',
  }
  return texts[priority as keyof typeof texts] || priority
}
</script>