<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 px-4 py-8">
    <div class="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">CRM Sistemi</h1>
        <p class="text-gray-600">Yeni hesap oluşturun</p>
      </div>

      <form @submit.prevent="handleRegister">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Ad *</label>
            <input
              v-model="form.firstName"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Adınız"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Soyad *</label>
            <input
              v-model="form.lastName"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Soyadınız"
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">E-posta *</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="ornek@email.com"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Şifre *</label>
            <input
              v-model="form.password"
              type="password"
              required
              minlength="6"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Şifre Tekrar *</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              required
              minlength="6"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="+90 555 123 4567"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Departman</label>
            <input
              v-model="form.department"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Satış"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50"
        >
          {{ loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Zaten hesabınız var mı?
          <NuxtLink to="/login" class="text-purple-500 hover:underline font-medium">
            Giriş Yapın
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  department: '',
  role: 'sales',
})

const handleRegister = async () => {
  loading.value = true
  errorMessage.value = ''

  // Validate passwords match
  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Şifreler eşleşmiyor'
    loading.value = false
    return
  }

  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: form.value,
    })

    if (response.success) {
      // Store user in local storage
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // Redirect to dashboard
      router.push('/')
    }
  } catch (error: any) {
    console.error('Register error:', error)
    errorMessage.value = error.data?.message || 'Kayıt sırasında bir hata oluştu'
  } finally {
    loading.value = false
  }
}
</script>