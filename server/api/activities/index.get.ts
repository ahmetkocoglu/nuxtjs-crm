import { connectDB } from '../../utils/mongoose'
import { Activity } from '../../models/Activity'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const query = getQuery(event)
    const customerId = query.customerId
    const dealId = query.dealId
    const type = query.type
    const limit = query.limit ? parseInt(query.limit as string) : 50
    
    const filter: any = {}
    if (customerId) filter.customer = customerId
    if (dealId) filter.deal = dealId
    if (type) filter.type = type
    
    const activities = await Activity.find(filter)
      .populate('customer', 'firstName lastName email company')
      .populate('deal', 'title value stage')
      .populate('task', 'title status')
      .sort({ createdAt: -1 })
      .limit(limit)
    
    return {
      success: true,
      data: activities,
    }
  } catch (error) {
    console.error('Error fetching activities:', error)
    throw createError({
      statusCode: 500,
      message: 'Aktiviteler getirilirken bir hata oluştu',
    })
  }
})