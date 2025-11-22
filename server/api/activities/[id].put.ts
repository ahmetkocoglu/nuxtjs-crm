import { Activity } from '../../models/Activity'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    const activity = await Activity.findByIdAndUpdate(id, body, { new: true })
      .populate('customer', 'firstName lastName email company')
      .populate('deal', 'title value stage')
      .populate('task', 'title status')
    
    if (!activity) {
      throw createError({
        statusCode: 404,
        message: 'Aktivite bulunamadı',
      })
    }
    
    return {
      success: true,
      data: activity,
      message: 'Aktivite başarıyla güncellendi',
    }
  } catch (error) {
    console.error('Error updating activity:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Aktivite güncellenirken bir hata oluştu',
    })
  }
})