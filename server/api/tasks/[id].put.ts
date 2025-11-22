import { connectDB } from '../../utils/mongoose'
import { Task } from '../../models/Task'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    // Eğer görev tamamlandı olarak işaretleniyorsa, tamamlanma tarihini ekle
    if (body.status === 'completed' && !body.completedAt) {
      body.completedAt = new Date()
    }
    
    const task = await Task.findByIdAndUpdate(id, body, { new: true })
      .populate('customer', 'firstName lastName email company')
    
    if (!task) {
      throw createError({
        statusCode: 404,
        message: 'Görev bulunamadı',
      })
    }
    
    return {
      success: true,
      data: task,
      message: 'Görev başarıyla güncellendi',
    }
  } catch (error: any) {
    console.error('Error updating task:', error)
    throw createError({
      statusCode: 400,
      message: error.message || 'Görev güncellenirken bir hata oluştu',
    })
  }
})