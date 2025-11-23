import { connectDB } from '../../utils/mongoose'
import { Notification } from '../../models/Notification'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const user = event.context.user
    
    await Notification.deleteMany({ user: user._id, isRead: true })
    
    return {
      success: true,
      message: 'Okunmuş bildirimler temizlendi',
    }
  } catch (error) {
    console.error('Error clearing notifications:', error)
    throw createError({
      statusCode: 500,
      message: 'Bildirimler temizlenirken bir hata oluştu',
    })
  }
})