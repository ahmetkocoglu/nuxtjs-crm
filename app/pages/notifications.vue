<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Tüm Bildirimler</h1>
      <div class="flex gap-2">
        <button
          v-if="unreadCount > 0"
          @click="markAllAsRead"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tümünü Okundu İşaretle
        </button>
        <button
          @click="clearRead"
          class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Okunmuşları Temizle
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow-md">
        <h3 class="text-gray-500 text-sm font-medium mb-1">Toplam Bildirim</h3>
        <p class="text-2xl font-bold">{{ notifications.length }}</p>
      </div>
      <div class="bg-blue-50 p-4 rounded-lg shadow-md">
        <h3 class="text-blue-700 text-sm font-medium mb-1">Okunmamış</h3>
        <p class="text-2xl font-bold text-blue-700">{{ unreadCount }}</p>
      </div>
      <div class="bg-green-50 p-4 rounded-lg shadow-md">
        <h3 class="text-green-700 text-sm font-medium mb-1">Okunmuş</h3>
        <p class="text-2xl font-bold text-green-700">{{ notifications.length - unreadCount }}</p>
      </div>
    </div>

    <!-- Notifications List -->
    <div v-if="loading" class="text-center py-12">
      <div class="text-4xl mb-2">🔄</div>
      <p class="text-gray-500">Yükleniyor...</p>
    </div>

    <div v-else-if="notifications.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
      <div class="text-6xl mb-4">🔔</div>
      <h3 class="text-xl font-semibold mb-2">Henüz bildirim yok</h3>
      <p class="text-gray-500">Yeni bildirimler burada görünecek</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="notification in notifications"
        :key="notification._id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        :class="{ 'border-l-4 border-blue-500 bg-blue-50': !notification.isRead }"
      >
        <div class="flex gap-4">
          <!-- Icon -->
          <div class="text-4xl flex-shrink-0">
            {{ notification.icon }}
          </div>

          <!-- Content -->
          <div class="flex-1">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h3 class="font-semibold text-lg mb-1">{{ notification.title }}</h3>
                <p class="text-gray-700">{{ notification.message }}</p>
              </div>
              <button
                @click="deleteNotification(notification._id)"
                class="text-gray-400 hover:text-red-500 flex-shrink-0 ml-4"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div class="flex items-center justify-between mt-3">
              <div class="flex items-center gap-4 text-sm text-gray-500">
                <span>{{ formatDateTime(notification.createdAt) }}</span>
                <span
                  v-if="notification.priority === 'high'"
                  class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium"
                >
                  Yüksek Öncelik
                </span>
              </div>

              <div class="flex items-center gap-2">
                <NuxtLink
                  v-if="notification.link"
                  :to="notification.link"
                  @click="markAsRead(notification._id)"
                  class="text-blue-500 hover:text-blue-700 text-sm font-medium"
                >
                  Görüntüle →
                </NuxtLink>

                <button
                  v-if="!notification.isRead"
                  @click="markAsRead(notification._id)"
                  class="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Okundu İşaretle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useNotifications} from "~/composables/useNotifications";

const {
  notifications,
  unreadCount,
  loading,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearRead,
} = useNotifications()

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>