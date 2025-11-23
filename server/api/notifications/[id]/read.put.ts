import { connectDB } from '../../../utils/mongoose'
import { Notification } from '../../../models/Notification'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const user = event.context.user
    const id = getRouterParam(event, 'id')
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    )
    
    if (!notification) {
      throw createError({
        statusCode: 404,
        message: 'Bildirim bulunamadı',
      })
    }
    
    return {
      success: true,
      data: notification,
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Bildirim güncellenirken bir hata oluştu',
    })
  }
})