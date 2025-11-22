import { connectDB } from '../../utils/mongoose'
import { Activity } from '../../models/Activity'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const body = await readBody(event)
    
    const activity = new Activity(body)
    await activity.save()
    
    await activity.populate('customer', 'firstName lastName email company')
    if (activity.deal) {
      await activity.populate('deal', 'title value stage')
    }
    if (activity.task) {
      await activity.populate('task', 'title status')
    }
    
    return {
      success: true,
      data: activity,
      message: 'Aktivite başarıyla oluşturuldu',
    }
  } catch (error) {
    console.error('Error creating activity:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Aktivite oluşturulurken bir hata oluştu',
    })
  }
})