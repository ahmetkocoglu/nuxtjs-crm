<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Profilim</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Profil Bilgileri -->
      <div class="md:col-span-1">
        <div class="bg-white rounded-lg shadow-md p-6 text-center">
          <div class="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            {{ user?.firstName[0] }}{{ user?.lastName[0] }}
          </div>
          <h2 class="text-2xl font-bold mb-1">{{ user?.firstName }} {{ user?.lastName }}</h2>
          <p class="text-gray-600 mb-2">{{ user?.email }}</p>
          <span
            class="px-3 py-1 rounded-full text-sm"
            :class="getRoleClass(user?.role)"
          >
            {{ getRoleText(user?.role) }}
          </span>

          <div class="mt-6 pt-6 border-t text-left space-y-2">
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-600">📞 Telefon:</span>
              <span class="font-medium">{{ user?.phone || '-' }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-600">🏢 Departman:</span>
              <span class="font-medium">{{ user?.department || '-' }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-600">📅 Kayıt Tarihi:</span>
              <span class="font-medium">{{ formatDate(user?.createdAt) }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-600">🕐 Son Giriş:</span>
              <span class="font-medium">{{ user?.lastLogin ? formatDateTime(user.lastLogin) : '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bilgileri Güncelle -->
      <div class="md:col-span-2">
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 class="text-xl font-semibold mb-4">Bilgilerimi Güncelle</h3>
          <form @submit.prevent="updateProfile">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Ad</label>
                <input
                  v-model="profileForm.firstName"
                  required
                  class="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Soyad</label>
                <input
                  v-model="profileForm.lastName"
                  required
                  class="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">E-posta</label>
                <input
                  v-model="profileForm.email"
                  type="email"
                  required
                  class="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Telefon</label>
                <input
                  v-model="profileForm.phone"
                  type="tel"
                  class="border p-2 rounded w-full"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-1">Departman</label>
                <input
                  v-model="profileForm.department"
                  class="border p-2 rounded w-full"
                />
              </div>
            </div>

            <div v-if="updateMessage" class="mt-4 p-3 rounded" :class="updateSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
              {{ updateMessage }}
            </div>

            <div class="mt-4">
              <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Güncelle
              </button>
            </div>
          </form>
        </div>

        <!-- Şifre Değiştir -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-xl font-semibold mb-4">Şifre Değiştir</h3>
          <form @submit.prevent="changePassword">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Mevcut Şifre</label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  required
                  class="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Yeni Şifre</label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  required
                  minlength="6"
                  class="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Yeni Şifre Tekrar</label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  required
                  minlength="6"
                  class="border p-2 rounded w-full"
                />
              </div>
            </div>

            <div v-if="passwordMessage" class="mt-4 p-3 rounded" :class="passwordSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
              {{ passwordMessage }}
            </div>

            <div class="mt-4">
              <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Şifreyi Değiştir
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Yetkiler -->
    <div class="mt-6 bg-white rounded-lg shadow-md p-6">
      <h3 class="text-xl font-semibold mb-4">Yetkilerim</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="(permissions, module) in user?.permissions" :key="module" class="border rounded p-4">
          <h4 class="font-semibold mb-2 capitalize">{{ getModuleName(module) }}</h4>
          <div class="space-y-1 text-sm">
            <div v-for="(value, action) in permissions" :key="action" class="flex items-center gap-2">
              <span v-if="value" class="text-green-600">✓</span>
              <span v-else class="text-red-600">✗</span>
              <span class="capitalize">{{ getActionName(action as string) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: userData, refresh: refreshUser } = await useFetch('/api/auth/me')
const user = computed(() => userData.value?.data)

const updateMessage = ref('')
const updateSuccess = ref(false)
const passwordMessage = ref('')
const passwordSuccess = ref(false)

const profileForm = ref({
  firstName: user.value?.firstName || '',
  lastName: user.value?.lastName || '',
  email: user.value?.email || '',
  phone: user.value?.phone || '',
  department: user.value?.department || '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

watch(user, (newUser) => {
  if (newUser) {
    profileForm.value = {
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone || '',
      department: newUser.department || '',
    }
  }
})

const updateProfile = async () => {
  updateMessage.value = ''
  try {
    await $fetch(`/api/users/${user.value?._id}`, {
      method: 'PUT',
      body: profileForm.value,
    })

    updateSuccess.value = true
    updateMessage.value = 'Profiliniz başarıyla güncellendi'
    refreshUser()

    setTimeout(() => {
      updateMessage.value = ''
    }, 3000)
  } catch (err: any) {
    updateSuccess.value = false
    updateMessage.value = err.data?.message || 'Profil güncellenirken bir hata oluştu'
  }
}

const changePassword = async () => {
  passwordMessage.value = ''

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordSuccess.value = false
    passwordMessage.value = 'Yeni şifreler eşleşmiyor'
    return
  }

  try {
    await $fetch('/api/users/change-password', {
      method: 'POST',
      body: {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
      },
    })

    passwordSuccess.value = true
    passwordMessage.value = 'Şifreniz başarıyla değiştirildi'
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }

    setTimeout(() => {
      passwordMessage.value = ''
    }, 3000)
  } catch (err: any) {
    passwordSuccess.value = false
    passwordMessage.value = err.data?.message || 'Şifre değiştirilirken bir hata oluştu'
  }
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDateTime = (date: string) => {
  if (!date) return '-'
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

const getModuleName = (module: string) => {
  const names: any = {
    customers: 'Müşteriler',
    deals: 'Fırsatlar',
    tasks: 'Görevler',
    activities: 'Aktiviteler',
    emails: 'E-postalar',
    users: 'Kullanıcılar',
  }
  return names[module] || module
}

const getActionName = (action: string) => {
  const names: any = {
    view: 'Görüntüle',
    create: 'Oluştur',
    edit: 'Düzenle',
    delete: 'Sil',
    send: 'Gönder',
  }
  return names[action] || action
}
</script>