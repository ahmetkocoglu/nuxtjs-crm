import { connectDB } from '../../utils/mongoose'
import { Activity } from '../../models/Activity'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const id = getRouterParam(event, 'id')
    
    const activity = await Activity.findByIdAndDelete(id)
    
    if (!activity) {
      throw createError({
        statusCode: 404,
        message: 'Aktivite bulunamadı',
      })
    }
    
    return {
      success: true,
      message: 'Aktivite başarıyla silindi',
    }
  } catch (error) {
    console.error('Error deleting activity:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Aktivite silinirken bir hata oluştu',
    })
  }
})