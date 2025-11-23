import { connectDB } from '../../utils/mongoose'
import { Notification } from '../../models/Notification'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const user = event.context.user
    const query = getQuery(event)
    const limit = query.limit ? parseInt(query.limit as string) : 20
    const unreadOnly = query.unreadOnly === 'true'
    
    const filter: any = { user: user._id }
    if (unreadOnly) {
      filter.isRead = false
    }
    
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
    
    const unreadCount = await Notification.countDocuments({
      user: user._id,
      isRead: false,
    })
    
    return {
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    throw createError({
      statusCode: 500,
      message: 'Bildirimler getirilirken bir hata oluştu',
    })
  }
})