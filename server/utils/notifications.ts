import { Notification } from '../models/Notification'

export interface CreateNotificationOptions {
  userId: string
  type: 'task' | 'deal' | 'activity' | 'email' | 'system' | 'reminder'
  title: string
  message: string
  link?: string
  icon?: string
  priority?: 'low' | 'medium' | 'high'
  relatedModel?: string
  relatedId?: string
}

export const createNotification = async (options: CreateNotificationOptions) => {
  try {
    const notification = await Notification.create({
      user: options.userId,
      type: options.type,
      title: options.title,
      message: options.message,
      link: options.link,
      icon: options.icon || getDefaultIcon(options.type),
      priority: options.priority || 'medium',
      relatedModel: options.relatedModel,
      relatedId: options.relatedId,
    })
    
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

export const createBulkNotifications = async (notifications: CreateNotificationOptions[]) => {
  try {
    const notificationDocs = notifications.map(notif => ({
      user: notif.userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      link: notif.link,
      icon: notif.icon || getDefaultIcon(notif.type),
      priority: notif.priority || 'medium',
      relatedModel: notif.relatedModel,
      relatedId: notif.relatedId,
    }))
    
    return await Notification.insertMany(notificationDocs)
  } catch (error) {
    console.error('Error creating bulk notifications:', error)
    return []
  }
}

function getDefaultIcon(type: string): string {
  const icons: any = {
    task: '✅',
    deal: '💼',
    activity: '📊',
    email: '✉️',
    system: '🔔',
    reminder: '⏰',
  }
  return icons[type] || '🔔'
}