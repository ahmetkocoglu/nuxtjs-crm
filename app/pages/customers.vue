<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">CRM - Müşteri Yönetimi</h1>

    <div class="mb-4">
      <button
        @click="showAddForm = !showAddForm"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Yeni Müşteri Ekle
      </button>
    </div>

    <!-- Müşteri Ekleme Formu -->
    <div v-if="showAddForm" class="bg-white p-6 rounded shadow-md mb-6">
      <h2 class="text-xl font-semibold mb-4">Yeni Müşteri</h2>
      <form @submit.prevent="addCustomer">
        <div class="grid grid-cols-2 gap-4">
          <input v-model="newCustomer.firstName" placeholder="Ad" required class="border p-2 rounded" />
          <input v-model="newCustomer.lastName" placeholder="Soyad" required class="border p-2 rounded" />
          <input v-model="newCustomer.email" type="email" placeholder="E-posta" required class="border p-2 rounded" />
          <input v-model="newCustomer.phone" placeholder="Telefon" class="border p-2 rounded" />
          <input v-model="newCustomer.company" placeholder="Şirket" class="border p-2 rounded" />
          <select v-model="newCustomer.status" class="border p-2 rounded">
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="customer">Müşteri</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>
        <textarea v-model="newCustomer.notes" placeholder="Notlar" class="border p-2 rounded w-full mt-4" rows="3"></textarea>
        <div class="mt-4">
          <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2">
            Kaydet
          </button>
          <button type="button" @click="showAddForm = false" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            İptal
          </button>
        </div>
      </form>
    </div>

    <!-- Müşteri Listesi -->
    <div v-if="pending" class="text-center">Yükleniyor...</div>
    <div v-else-if="error" class="text-red-500">Hata: {{ error.message }}</div>
    <div v-else class="bg-white rounded shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-100">
        <tr>
          <th class="p-3 text-left">Ad Soyad</th>
          <th class="p-3 text-left">E-posta</th>
          <th class="p-3 text-left">Telefon</th>
          <th class="p-3 text-left">Şirket</th>
          <th class="p-3 text-left">Durum</th>
          <th class="p-3 text-left">İşlemler</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="customer in customers" :key="customer._id" class="border-t hover:bg-gray-50">
          <td class="p-3">{{ customer.firstName }} {{ customer.lastName }}</td>
          <td class="p-3">{{ customer.email }}</td>
          <td class="p-3">{{ customer.phone }}</td>
          <td class="p-3">{{ customer.company }}</td>
          <td class="p-3">
              <span class="px-2 py-1 rounded text-sm" :class="getStatusClass(customer.status)">
                {{ getStatusText(customer.status) }}
              </span>
          </td>
          <td class="p-3">
            <button @click="deleteCustomer(customer._id)" class="text-red-500 hover:text-red-700">
              Sil
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const showAddForm = ref(false)
const newCustomer = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  status: 'lead',
  notes: '',
})

const { data, pending, error, refresh } = await useFetch('/api/customers')
const customers = computed(() => data.value?.data || [])

const addCustomer = async () => {
  try {
    await $fetch('/api/customers', {
      method: 'POST',
      body: newCustomer.value,
    })

    // Formu temizle
    newCustomer.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      status: 'lead',
      notes: '',
    }

    showAddForm.value = false
    refresh()
  } catch (err) {
    console.error('Müşteri eklenirken hata:', err)
    alert('Müşteri eklenirken bir hata oluştu')
  }
}

const deleteCustomer = async (id: string) => {
  if (!confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(`/api/customers/${id}`, { method: 'DELETE' })
    refresh()
  } catch (err) {
    console.error('Müşteri silinirken hata:', err)
    alert('Müşteri silinirken bir hata oluştu')
  }
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
</script>

<style scoped>

</style>