import { connectDB } from '../../utils/mongoose'
import { Notification } from '../../models/Notification'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const user = event.context.user
    
    await Notification.updateMany(
      { user: user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    )
    
    return {
      success: true,
      message: 'Tüm bildirimler okundu olarak işaretlendi',
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw createError({
      statusCode: 500,
      message: 'Bildirimler güncellenirken bir hata oluştu',
    })
  }
})