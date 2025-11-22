import { connectDB } from '../../utils/mongoose'
import { Activity } from '../../models/Activity'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const query = getQuery(event)
    const customerId = query.customerId
    
    const filter: any = {}
    if (customerId) filter.customer = customerId
    
    const stats = await Activity.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ])
    
    const totalActivities = await Activity.countDocuments(filter)
    
    return {
      success: true,
      data: {
        total: totalActivities,
        byType: stats,
      },
    }
  } catch (error) {
    console.error('Error fetching activity stats:', error)
    throw createError({
      statusCode: 500,
      message: 'İstatistikler getirilirken bir hata oluştu',
    })
  }
})