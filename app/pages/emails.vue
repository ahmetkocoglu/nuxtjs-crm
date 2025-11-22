<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">E-posta Yönetimi</h1>
      <button
        @click="showComposeForm = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        ✉️ Yeni E-posta
      </button>
    </div>

    <!-- İstatistikler -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow-md">
        <h3 class="text-gray-500 text-sm font-medium mb-1">Toplam</h3>
        <p class="text-2xl font-bold">{{ emails.length }}</p>
      </div>
      <div class="bg-green-50 p-4 rounded-lg shadow-md">
        <h3 class="text-green-700 text-sm font-medium mb-1">Gönderilen</h3>
        <p class="text-2xl font-bold text-green-700">{{ sentCount }}</p>
      </div>
      <div class="bg-red-50 p-4 rounded-lg shadow-md">
        <h3 class="text-red-700 text-sm font-medium mb-1">Başarısız</h3>
        <p class="text-2xl font-bold text-red-700">{{ failedCount }}</p>
      </div>
      <div class="bg-blue-50 p-4 rounded-lg shadow-md">
        <h3 class="text-blue-700 text-sm font-medium mb-1">Planlanmış</h3>
        <p class="text-2xl font-bold text-blue-700">{{ scheduledCount }}</p>
      </div>
    </div>

    <!-- E-posta Oluşturma Formu -->
    <div v-if="showComposeForm" class="bg-white p-6 rounded shadow-md mb-6">
      <h2 class="text-xl font-semibold mb-4">Yeni E-posta</h2>
      <form @submit.prevent="sendEmail">
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Müşteri *</label>
            <select
              v-model="emailForm.customer"
              required
              class="border p-2 rounded w-full"
              @change="onCustomerChange"
            >
              <option value="">Müşteri Seçin</option>
              <option
                v-for="customer in customers"
                :key="customer._id"
                :value="customer._id"
              >
                {{ customer.firstName }} {{ customer.lastName }} - {{ customer.email }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Şablon</label>
            <select
              v-model="selectedTemplate"
              class="border p-2 rounded w-full"
              @change="loadTemplate"
            >
              <option value="">Şablon Seçin (Opsiyonel)</option>
              <option value="welcome">🎉 Hoş Geldiniz</option>
              <option value="followUp">📞 Takip</option>
              <option value="dealProposal">💼 Fırsat Teklifi</option>
              <option value="taskReminder">⏰ Görev Hatırlatması</option>
            </select>
          </div>

          <div v-if="selectedTemplate === 'dealProposal'">
            <label class="block text-sm font-medium mb-1">İlgili Fırsat</label>
            <select v-model="emailForm.deal" class="border p-2 rounded w-full">
              <option value="">Seçin</option>
              <option
                v-for="deal in customerDeals"
                :key="deal._id"
                :value="deal._id"
              >
                {{ deal.title }} - {{ formatCurrency(deal.value) }}
              </option>
            </select>
          </div>

          <div v-if="selectedTemplate === 'taskReminder'">
            <label class="block text-sm font-medium mb-1">İlgili Görev</label>
            <select v-model="emailForm.task" class="border p-2 rounded w-full">
              <option value="">Seçin</option>
              <option
                v-for="task in customerTasks"
                :key="task._id"
                :value="task._id"
              >
                {{ task.title }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Alıcı (E-posta) *</label>
            <input
              v-model="emailForm.to"
              type="email"
              required
              class="border p-2 rounded w-full"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Konu *</label>
            <input
              v-model="emailForm.subject"
              required
              class="border p-2 rounded w-full"
              placeholder="E-posta konusu"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Mesaj *</label>
            <textarea
              v-model="emailForm.body"
              required
              class="border p-2 rounded w-full"
              rows="10"
              placeholder="E-posta içeriği..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">CC (Karbon Kopya)</label>
            <input
              v-model="emailForm.cc"
              type="email"
              class="border p-2 rounded w-full"
              placeholder="cc@example.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Gönderen Adı</label>
            <input
              v-model="emailForm.sentBy"
              class="border p-2 rounded w-full"
              placeholder="İsminiz"
            />
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" :disabled="sending">
            {{ sending ? 'Gönderiliyor...' : '✉️ Gönder' }}
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
          <label class="block text-sm font-medium mb-1">Durum</label>
          <select v-model="filterStatus" class="border p-2 rounded w-full">
            <option value="">Tümü</option>
            <option value="sent">Gönderildi</option>
            <option value="failed">Başarısız</option>
            <option value="scheduled">Planlandı</option>
            <option value="draft">Taslak</option>
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
      </div>
    </div>

    <!-- E-posta Listesi -->
    <div v-if="pending" class="text-center">Yükleniyor...</div>
    <div v-else-if="error" class="text-red-500">Hata: {{ error.message }}</div>
    <div v-else class="bg-white rounded shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-100">
        <tr>
          <th class="p-3 text-left">Durum</th>
          <th class="p-3 text-left">Müşteri</th>
          <th class="p-3 text-left">Konu</th>
          <th class="p-3 text-left">Alıcı</th>
          <th class="p-3 text-left">Tarih</th>
          <th class="p-3 text-left">İşlemler</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="email in filteredEmails" :key="email._id" class="border-t hover:bg-gray-50">
          <td class="p-3">
              <span
                class="px-2 py-1 rounded text-xs font-medium"
                :class="getStatusClass(email.status)"
              >
                {{ getStatusText(email.status) }}
              </span>
          </td>
          <td class="p-3">
            <div>{{ email.customer?.firstName }} {{ email.customer?.lastName }}</div>
            <div class="text-sm text-gray-500">{{ email.customer?.company }}</div>
          </td>
          <td class="p-3 font-medium">{{ email.subject }}</td>
          <td class="p-3 text-sm">{{ email.to[0] }}</td>
          <td class="p-3 text-sm">
            {{ email.sentAt ? formatDateTime(email.sentAt) : formatDateTime(email.createdAt) }}
          </td>
          <td class="p-3">
            <div class="flex gap-2">
              <button
                @click="viewEmail(email)"
                class="text-blue-500 hover:text-blue-700 text-sm"
              >
                Görüntüle
              </button>
              <button
                @click="deleteEmail(email._id)"
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

    <div v-if="!pending && filteredEmails.length === 0" class="text-center text-gray-500 mt-8">
      Henüz e-posta bulunmuyor.
    </div>

    <!-- E-posta Görüntüleme Modal -->
    <div
      v-if="viewingEmail"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="viewingEmail = null"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-bold mb-2">{{ viewingEmail.subject }}</h2>
            <div class="text-sm text-gray-600 space-y-1">
              <p><strong>Gönderen:</strong> {{ process.env.EMAIL_FROM }}</p>
              <p><strong>Alıcı:</strong> {{ viewingEmail.to.join(', ') }}</p>
              <p><strong>Tarih:</strong> {{ formatDateTime(viewingEmail.sentAt || viewingEmail.createdAt) }}</p>
              <p v-if="viewingEmail.cc && viewingEmail.cc.length">
                <strong>CC:</strong> {{ viewingEmail.cc.join(', ') }}
              </p>
            </div>
          </div>
          <button
            @click="viewingEmail = null"
            class="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div class="p-6">
          <div v-html="viewingEmail.body" class="prose max-w-none"></div>
        </div>
        <div class="p-6 border-t bg-gray-50">
          <button
            @click="viewingEmail = null"
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const showComposeForm = ref(false)
const selectedTemplate = ref('')
const sending = ref(false)
const filterStatus = ref('')
const filterCustomer = ref('')
const viewingEmail = ref<any>(null)

const emailForm = ref({
  customer: '',
  to: '',
  cc: '',
  subject: '',
  body: '',
  deal: '',
  task: '',
  sentBy: '',
  template: '',
})

const { data, pending, error, refresh } = await useFetch('/api/emails')
const { data: customersData } = await useFetch('/api/customers')
const { data: dealsData } = await useFetch('/api/deals')
const { data: tasksData } = await useFetch('/api/tasks')

const emails = computed(() => data.value?.data || [])
const customers = computed(() => customersData.value?.data || [])
const deals = computed(() => dealsData.value?.data || [])
const tasks = computed(() => tasksData.value?.data || [])

const selectedCustomer = computed(() => {
  return customers.value.find((c: any) => c._id === emailForm.value.customer)
})

const customerDeals = computed(() => {
  return deals.value.filter((d: any) => d.customer._id === emailForm.value.customer)
})

const customerTasks = computed(() => {
  return tasks.value.filter((t: any) => t.customer._id === emailForm.value.customer)
})

const filteredEmails = computed(() => {
  return emails.value.filter((email: any) => {
    if (filterStatus.value && email.status !== filterStatus.value) return false
    if (filterCustomer.value && email.customer._id !== filterCustomer.value) return false
    return true
  })
})

const sentCount = computed(() => emails.value.filter((e: any) => e.status === 'sent').length)
const failedCount = computed(() => emails.value.filter((e: any) => e.status === 'failed').length)
const scheduledCount = computed(() => emails.value.filter((e: any) => e.status === 'scheduled').length)

const onCustomerChange = () => {
  const customer = selectedCustomer.value
  if (customer) {
    emailForm.value.to = customer.email
  }
}

const loadTemplate = async () => {
  if (!selectedTemplate.value || !selectedCustomer.value) return

  try {
    const params: any = {
      customerName: `${selectedCustomer.value.firstName} ${selectedCustomer.value.lastName}`,
    }

    if (selectedTemplate.value === 'dealProposal' && emailForm.value.deal) {
      const deal = customerDeals.value.find((d: any) => d._id === emailForm.value.deal)
      if (deal) {
        params.dealTitle = deal.title
        params.dealValue = formatCurrency(deal.value)
      }
    }

    if (selectedTemplate.value === 'taskReminder' && emailForm.value.task) {
      const task = customerTasks.value.find((t: any) => t._id === emailForm.value.task)
      if (task) {
        params.taskTitle = task.title
        params.dueDate = formatDateTime(task.dueDate)
      }
    }

    if (selectedTemplate.value === 'followUp') {
      params.message = 'Görüşmemizin ardından size ulaşmak istedik...'
    }

    const queryString = new URLSearchParams(params).toString()
    const { data: templateData } = await useFetch(`/api/emails/templates/${selectedTemplate.value}?${queryString}`)

    if (templateData.value?.data) {
      emailForm.value.subject = templateData.value.data.subject
      emailForm.value.body = templateData.value.data.html
      emailForm.value.template = selectedTemplate.value
    }
  } catch (err) {
    console.error('Şablon yüklenirken hata:', err)
  }
}

const sendEmail = async () => {
  if (sending.value) return

  sending.value = true
  try {
    await $fetch('/api/emails/send', {
      method: 'POST',
      body: {
        ...emailForm.value,
        to: [emailForm.value.to],
        cc: emailForm.value.cc ? [emailForm.value.cc] : undefined,
      },
    })

    cancelForm()
    refresh()
    alert('E-posta başarıyla gönderildi!')
  } catch (err) {
    console.error('E-posta gönderilirken hata:', err)
    alert('E-posta gönderilirken bir hata oluştu')
  } finally {
    sending.value = false
  }
}

const viewEmail = (email: any) => {
  viewingEmail.value = email
}

const deleteEmail = async (id: string) => {
  if (!confirm('Bu e-postayı silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(`/api/emails/${id}`, { method: 'DELETE' })
    refresh()
  } catch (err) {
    console.error('E-posta silinirken hata:', err)
    alert('E-posta silinirken bir hata oluştu')
  }
}

const cancelForm = () => {
  showComposeForm.value = false
  selectedTemplate.value = ''
  emailForm.value = {
    customer: '',
    to: '',
    cc: '',
    subject: '',
    body: '',
    deal: '',
    task: '',
    sentBy: '',
    template: '',
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

const getStatusClass = (status: string) => {
  const classes = {
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    scheduled: 'bg-blue-100 text-blue-800',
    draft: 'bg-gray-100 text-gray-800',
  }
  return classes[status as keyof typeof classes] || ''
}

const getStatusText = (status: string) => {
  const texts = {
    sent: 'Gönderildi',
    failed: 'Başarısız',
    scheduled: 'Planlandı',
    draft: 'Taslak',
  }
  return texts[status as keyof typeof texts] || status
}
</script>