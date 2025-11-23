<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-md sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-8">
            <NuxtLink to="/" class="text-2xl font-bold text-blue-600">
              CRM
            </NuxtLink>

            <nav class="hidden md:flex items-center gap-6">
              <NuxtLink
                to="/"
                class="text-gray-700 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 font-semibold"
              >
                Dashboard
              </NuxtLink>
              <NuxtLink
                to="/customers"
                class="text-gray-700 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 font-semibold"
              >
                Müşteriler
              </NuxtLink>
              <NuxtLink
                to="/deals"
                class="text-gray-700 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 font-semibold"
              >
                Fırsatlar
              </NuxtLink>
              <NuxtLink
                to="/tasks"
                class="text-gray-700 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 font-semibold"
              >
                Görevler
              </NuxtLink>
              <NuxtLink
                to="/activities"
                class="text-gray-700 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 font-semibold"
              >
                Aktiviteler
              </NuxtLink>
              <NuxtLink
                to="/emails"
                class="text-gray-700 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 font-semibold"
              >
                E-postalar
              </NuxtLink>
              <NuxtLink
                v-if="canViewUsers"
                to="/users"
                class="text-gray-700 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 font-semibold"
              >
                Kullanıcılar
              </NuxtLink>
            </nav>
          </div>

          <div class="flex items-center gap-4">
            <div v-if="user" class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
              >
                <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                  {{ user.firstName[0] }}{{ user.lastName[0] }}
                </div>
                <span class="hidden md:block font-medium">{{ user.firstName }} {{ user.lastName }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border"
              >
                <NuxtLink
                  to="/profile"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  👤 Profilim
                </NuxtLink>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  🚪 Çıkış Yap
                </button>
              </div>
            </div>

            <button
              @click="showMobileMenu = !showMobileMenu"
              class="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div v-if="showMobileMenu" class="md:hidden py-4 border-t">
          <nav class="flex flex-col gap-2">
            <NuxtLink to="/" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" @click="showMobileMenu = false">
              Dashboard
            </NuxtLink>
            <NuxtLink to="/customers" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" @click="showMobileMenu = false">
              Müşteriler
            </NuxtLink>
            <NuxtLink to="/deals" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" @click="showMobileMenu = false">
              Fırsatlar
            </NuxtLink>
            <NuxtLink to="/tasks" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" @click="showMobileMenu = false">
              Görevler
            </NuxtLink>
            <NuxtLink to="/activities" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" @click="showMobileMenu = false">
              Aktiviteler
            </NuxtLink>
            <NuxtLink to="/emails" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" @click="showMobileMenu = false">
              E-postalar
            </NuxtLink>
            <NuxtLink v-if="canViewUsers" to="/users" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" @click="showMobileMenu = false">
              Kullanıcılar
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-12">
      <div class="container mx-auto px-4 py-6">
        <div class="text-center text-gray-600 text-sm">
          <p>&copy; {{ new Date().getFullYear() }} CRM Sistemi. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const showUserMenu = ref(false)
const showMobileMenu = ref(false)

const { data: userData } = await useFetch('/api/auth/me')
const user = computed(() => userData.value?.data)
const canViewUsers = computed(() => user.value?.permissions?.users?.view || user.value?.role === 'admin')

// Close menus when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('button')) {
      showUserMenu.value = false
    }
  })
})

const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('user')
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Redirect to login if not authenticated
watch(userData, (data) => {
  if (data?.success === false || !data?.data) {
    router.push('/login')
  }
}, { immediate: true })
</script>