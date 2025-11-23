<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Kullanıcı Yönetimi</h1>
      <button
        v-if="canCreate"
        @click="showAddForm = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        👤 Yeni Kullanıcı Ekle
      </button>
    </div>

    <!-- İstatistikler -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow-md">
        <h3 class="text-gray-500 text-sm font-medium mb-1">Toplam Kullanıcı</h3>
        <p class="text-2xl font-bold">{{ users.length }}</p>
      </div>
      <div class="bg-green-50 p-4 rounded-lg shadow-md">
        <h3 class="text-green-700 text-sm font-medium mb-1">Aktif</h3>
        <p class="text-2xl font-bold text-green-700">{{ activeUsers }}</p>
      </div>
      <div class="bg-blue-50 p-4 rounded-lg shadow-md">
        <h3 class="text-blue-700 text-sm font-medium mb-1">Adminler</h3>
        <p class="text-2xl font-bold text-blue-700">{{ adminCount }}</p>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg shadow-md">
        <h3 class="text-purple-700 text-sm font-medium mb-1">Satış Ekibi</h3>
        <p class="text-2xl font-bold text-purple-700">{{ salesCount }}</p>
      </div>
    </div>

    <!-- Kullanıcı Ekleme/Düzenleme Formu -->
    <div v-if="showAddForm" class="bg-white p-6 rounded shadow-md mb-6">
      <h2 class="text-xl font-semibold mb-4">{{ editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı' }}</h2>
      <form @submit.prevent="saveUser">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Ad *</label>
            <input
              v-model="userForm.firstName"
              required
              class="border p-2 rounded w-full"
              placeholder="Ad"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Soyad *</label>
            <input
              v-model="userForm.lastName"
              required
              class="border p-2 rounded w-full"
              placeholder="Soyad"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">E-posta *</label>
            <input
              v-model="userForm.email"
              type="email"
              required
              class="border p-2 rounded w-full"
              placeholder="email@example.com"
            />
          </div>

          <div v-if="!editingUser">
            <label class="block text-sm font-medium mb-1">Şifre *</label>
            <input
              v-model="userForm.password"
              type="password"
              :required="!editingUser"
              minlength="6"
              class="border p-2 rounded w-full"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Telefon</label>
            <input
              v-model="userForm.phone"
              type="tel"
              class="border p-2 rounded w-full"
              placeholder="+90 555 123 4567"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Departman</label>
            <input
              v-model="userForm.department"
              class="border p-2 rounded w-full"
              placeholder="Satış, Destek, vb."
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Rol *</label>
            <select v-model="userForm.role" required class="border p-2 rounded w-full">
              <option value="sales">Satış</option>
              <option value="manager">Yönetici</option>
              <option value="support">Destek</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Durum</label>
            <select v-model="userForm.isActive" class="border p-2 rounded w-full">
              <option :value="true">Aktif</option>
              <option :value="false">Pasif</option>
            </select>
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            {{ editingUser ? 'Güncelle' : 'Kaydet' }}
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
          <label class="block text-sm font-medium mb-1">Rol</label>
          <select v-model="filterRole" class="border p-2 rounded w-full">
            <option value="">Tümü</option>
            <option value="admin">Admin</option>
            <option value="manager">Yönetici</option>
            <option value="sales">Satış</option>
            <option value="support">Destek</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Durum</label>
          <select v-model="filterStatus" class="border p-2 rounded w-full">
            <option value="">Tümü</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Kullanıcı Listesi -->
    <div v-if="pending" class="text-center">Yükleniyor...</div>
    <div v-else-if="error" class="text-red-500">{{ getErrorMessage(error) }}</div>
    <div v-else class="bg-white rounded shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-100">
        <tr>
          <th class="p-3 text-left">Kullanıcı</th>
          <th class="p-3 text-left">E-posta</th>
          <th class="p-3 text-left">Rol</th>
          <th class="p-3 text-left">Departman</th>
          <th class="p-3 text-left">Durum</th>
          <th class="p-3 text-left">Son Giriş</th>
          <th class="p-3 text-left">İşlemler</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in filteredUsers" :key="user._id" class="border-t hover:bg-gray-50">
          <td class="p-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                {{ user.firstName[0] }}{{ user.lastName[0] }}
              </div>
              <div>
                <div class="font-medium">{{ user.firstName }} {{ user.lastName }}</div>
                <div class="text-sm text-gray-500">{{ user.phone }}</div>
              </div>
            </div>
          </td>
          <td class="p-3 text-sm">{{ user.email }}</td>
          <td class="p-3">
              <span
                class="px-2 py-1 rounded text-sm"
                :class="getRoleClass(user.role)"
              >
                {{ getRoleText(user.role) }}
              </span>
          </td>
          <td class="p-3 text-sm">{{ user.department || '-' }}</td>
          <td class="p-3">
              <span
                class="px-2 py-1 rounded text-sm"
                :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ user.isActive ? 'Aktif' : 'Pasif' }}
              </span>
          </td>
          <td class="p-3 text-sm">
            {{ user.lastLogin ? formatDateTime(user.lastLogin) : 'Hiç giriş yapmadı' }}
          </td>
          <td class="p-3">
            <div class="flex gap-2">
              <button
                v-if="canEdit"
                @click="editUser(user)"
                class="text-blue-500 hover:text-blue-700 text-sm"
              >
                Düzenle
              </button>
              <button
                v-if="canDelete && user._id !== currentUser?._id"
                @click="deleteUser(user._id)"
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

    <div v-if="!pending && filteredUsers.length === 0" class="text-center text-gray-500 mt-8">
      Kullanıcı bulunmuyor.
    </div>
  </div>
</template>

<script setup lang="ts">
const showAddForm = ref(false)
const editingUser = ref<any>(null)
const filterRole = ref('')
const filterStatus = ref('')

const userForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  department: '',
  role: 'sales',
  isActive: true,
})

const { data, pending, error, refresh } = await useFetch('/api/users')
const { data: meData } = await useFetch('/api/auth/me')

const users = computed(() => data.value?.data || [])
const currentUser = computed(() => meData.value?.data)

const canCreate = computed(() => currentUser.value?.permissions?.users?.create || currentUser.value?.role === 'admin')
const canEdit = computed(() => currentUser.value?.permissions?.users?.edit || currentUser.value?.role === 'admin')
const canDelete = computed(() => currentUser.value?.permissions?.users?.delete || currentUser.value?.role === 'admin')

const filteredUsers = computed(() => {
  return users.value.filter((user: any) => {
    if (filterRole.value && user.role !== filterRole.value) return false
    if (filterStatus.value === 'active' && !user.isActive) return false
    if (filterStatus.value === 'inactive' && user.isActive) return false
    return true
  })
})

const activeUsers = computed(() => users.value.filter((u: any) => u.isActive).length)
const adminCount = computed(() => users.value.filter((u: any) => u.role === 'admin').length)
const salesCount = computed(() => users.value.filter((u: any) => u.role === 'sales').length)

const saveUser = async () => {
  try {
    if (editingUser.value) {
      await $fetch(`/api/users/${editingUser.value._id}`, {
        method: 'PUT',
        body: userForm.value,
      })
    } else {
      await $fetch('/api/users', {
        method: 'POST',
        body: userForm.value,
      })
    }

    cancelForm()
    refresh()
  } catch (err: any) {
    console.error('Kullanıcı kaydedilirken hata:', err)
    alert(err.data?.message || 'Kullanıcı kaydedilirken bir hata oluştu')
  }
}

const editUser = (user: any) => {
  editingUser.value = user
  userForm.value = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: '',
    phone: user.phone || '',
    department: user.department || '',
    role: user.role,
    isActive: user.isActive,
  }
  showAddForm.value = true
}

const deleteUser = async (id: string) => {
  if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(`/api/users/${id}`, { method: 'DELETE' })
    refresh()
  } catch (err: any) {
    console.error('Kullanıcı silinirken hata:', err)
    alert(err.data?.message || 'Kullanıcı silinirken bir hata oluştu')
  }
}

const cancelForm = () => {
  showAddForm.value = false
  editingUser.value = null
  userForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    role: 'sales',
    isActive: true,
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

const getRoleClass = (role: string) => {
  const classes = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-purple-100 text-purple-800',
    sales: 'bg-blue-100 text-blue-800',
    support: 'bg-green-100 text-green-800',
  }
  return classes[role as keyof typeof classes] || ''
}

const getRoleText = (role: string) => {
  const texts = {
    admin: 'Admin',
    manager: 'Yönetici',
    sales: 'Satış',
    support: 'Destek',
  }
  return texts[role as keyof typeof texts] || role
}

const getErrorMessage = (error: any) => {
  return error?.data?.message || error?.message || 'Bir hata oluştu'
}
</script>