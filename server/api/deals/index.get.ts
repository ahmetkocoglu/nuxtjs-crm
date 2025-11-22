import { connectDB } from '../../utils/mongoose'
import { Deal } from '../../models/Deal'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const query = getQuery(event)
    const customerId = query.customerId
    const stage = query.stage
    
    const filter: any = {}
    if (customerId) filter.customer = customerId
    if (stage) filter.stage = stage
    
    const deals = await Deal.find(filter)
      .populate('customer', 'firstName lastName email company')
      .sort({ createdAt: -1 })
    
    return {
      success: true,
      data: deals,
    }
  } catch (error) {
    console.error('Error fetching deals:', error)
    throw createError({
      statusCode: 500,
      message: 'Fırsatlar getirilirken bir hata oluştu',
    })
  }
})