import { connectDB } from '../../utils/mongoose'
import { Task } from '../../models/Task'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const body = await readBody(event)
    
    const task = new Task(body)
    await task.save()
    
    // Populate customer bilgilerini ekle
    await task.populate('customer', 'firstName lastName email company')
    
    return {
      success: true,
      data: task,
      message: 'Görev başarıyla oluşturuldu',
    }
  } catch (error: any) {
    console.error('Error creating task:', error)
    throw createError({
      statusCode: 400,
      message: error.message || 'Görev oluşturulurken bir hata oluştu',
    })
  }
})