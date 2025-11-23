export const useNotifications = () => {
  const notifications = ref<any[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)

  const fetchNotifications = async (unreadOnly = false) => {
    loading.value = true
    try {
      const params: any = { limit: 20 }
      if (unreadOnly) params.unreadOnly = 'true'
      
      const response = await $fetch('/api/notifications', { params })
      
      if (response.success) {
        notifications.value = response.data.notifications
        unreadCount.value = response.data.unreadCount
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await $fetch(`/api/notifications/${id}/read`, { method: 'PUT' })
      
      const index = notifications.value.findIndex(n => n._id === id)
      if (index !== -1) {
        notifications.value[index].isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await $fetch('/api/notifications/read-all', { method: 'PUT' })
      
      notifications.value.forEach(n => n.isRead = true)
      unreadCount.value = 0
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await $fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      
      const index = notifications.value.findIndex(n => n._id === id)
      if (index !== -1) {
        if (!notifications.value[index].isRead) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const clearRead = async () => {
    try {
      await $fetch('/api/notifications/clear', { method: 'DELETE' })
      
      notifications.value = notifications.value.filter(n => !n.isRead)
    } catch (error) {
      console.error('Error clearing notifications:', error)
    }
  }

  // Auto refresh every 30 seconds
  let intervalId: any = null
  const startPolling = () => {
    intervalId = setInterval(() => {
      fetchNotifications()
    }, 30000)
  }

  const stopPolling = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  onMounted(() => {
    fetchNotifications()
    startPolling()
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearRead,
  }
}