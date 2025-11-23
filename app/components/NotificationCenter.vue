<template>
  <div class="relative">
    <!-- Bell Icon -->
    <button
      @click="showNotifications = !showNotifications"
      class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
      </svg>

      <!-- Unread Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- Notification Dropdown -->
    <div
      v-if="showNotifications"
      class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-[600px] flex flex-col"
    >
      <!-- Header -->
      <div class="p-4 border-b flex items-center justify-between">
        <h3 class="font-semibold text-lg">Bildirimler</h3>
        <div class="flex items-center gap-2">
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-sm text-blue-500 hover:text-blue-700"
          >
            Tümünü Okundu İşaretle
          </button>
          <button
            @click="clearRead"
            class="text-sm text-gray-500 hover:text-gray-700"
            title="Okunmuşları Temizle"
          >
            🗑️
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="overflow-y-auto flex-1">
        <div v-if="loading" class="p-4 text-center text-gray-500">
          Yükleniyor...
        </div>

        <div v-else-if="notifications.length === 0" class="p-8 text-center text-gray-500">
          <div class="text-4xl mb-2">🔔</div>
          <p>Henüz bildirim yok</p>
        </div>

        <div v-else>
          <div
            v-for="notification in notifications"
            :key="notification._id"
            class="border-b hover:bg-gray-50 transition-colors"
            :class="{ 'bg-blue-50': !notification.isRead }"
          >
            <div class="p-4 flex gap-3">
              <!-- Icon -->
              <div class="text-2xl flex-shrink-0">
                {{ notification.icon }}
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 mb-1">
                  <h4 class="font-medium text-sm">{{ notification.title }}</h4>
                  <button
                    @click="deleteNotification(notification._id)"
                    class="text-gray-400 hover:text-red-500 flex-shrink-0"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <p class="text-sm text-gray-600 mb-2">{{ notification.message }}</p>

                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500">
                    {{ formatTimeAgo(notification.createdAt) }}
                  </span>

                  <div class="flex items-center gap-2">
                    <NuxtLink
                      v-if="notification.link"
                      :to="notification.link"
                      @click="markAsRead(notification._id); showNotifications = false"
                      class="text-xs text-blue-500 hover:text-blue-700"
                    >
                      Görüntüle →
                    </NuxtLink>

                    <button
                      v-if="!notification.isRead"
                      @click="markAsRead(notification._id)"
                      class="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Okundu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-3 border-t bg-gray-50">
        <NuxtLink
          to="/notifications"
          @click="showNotifications = false"
          class="block text-center text-sm text-blue-500 hover:text-blue-700"
        >
          Tüm Bildirimleri Gör
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const showNotifications = ref(false)
const {
  notifications,
  unreadCount,
  loading,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearRead,
} = useNotifications()

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showNotifications.value = false
    }
  })
})

const formatTimeAgo = (date: string) => {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Az önce'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`

  return then.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  })
}
</script>