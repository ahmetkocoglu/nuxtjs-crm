import { connectDB } from '../../utils/mongoose'
import { Task } from '../../models/Task'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const id = getRouterParam(event, 'id')
    
    const task = await Task.findByIdAndDelete(id)
    
    if (!task) {
      throw createError({
        statusCode: 404,
        message: 'Görev bulunamadı',
      })
    }
    
    return {
      success: true,
      message: 'Görev başarıyla silindi',
    }
  } catch (error: any) {
    console.error('Error deleting task:', error)
    throw createError({
      statusCode: 400,
      message: error.message || 'Görev silinirken bir hata oluştu',
    })
  }
})