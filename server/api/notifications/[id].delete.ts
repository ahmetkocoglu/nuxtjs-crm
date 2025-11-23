import { connectDB } from '../../utils/mongoose'
import { Notification } from '../../models/Notification'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const user = event.context.user
    const id = getRouterParam(event, 'id')
    
    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: user._id,
    })
    
    if (!notification) {
      throw createError({
        statusCode: 404,
        message: 'Bildirim bulunamadı',
      })
    }
    
    return {
      success: true,
      message: 'Bildirim silindi',
    }
  } catch (error) {
    console.error('Error deleting notification:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Bildirim silinirken bir hata oluştu',
    })
  }
})