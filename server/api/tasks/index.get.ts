import { connectDB } from '../../utils/mongoose'
import { Task } from '../../models/Task'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    // Query parametrelerini al
    const query = getQuery(event)
    const customerId = query.customerId
    
    // Müşteriye göre filtreleme
    const filter = customerId ? { customer: customerId } : {}
    
    const tasks = await Task.find(filter)
      .populate('customer', 'firstName lastName email company')
      .sort({ dueDate: 1 })
    
    return {
      success: true,
      data: tasks,
    }
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw createError({
      statusCode: 500,
      message: 'Görevler getirilirken bir hata oluştu',
    })
  }
})