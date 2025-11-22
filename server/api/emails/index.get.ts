import { connectDB } from '../../utils/mongoose'
import { Email } from '../../models/Email'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const query = getQuery(event)
    const customerId = query.customerId
    const status = query.status
    
    const filter: any = {}
    if (customerId) filter.customer = customerId
    if (status) filter.status = status
    
    const emails = await Email.find(filter)
      .populate('customer', 'firstName lastName email company')
      .populate('deal', 'title value')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(100)
    
    return {
      success: true,
      data: emails,
    }
  } catch (error) {
    console.error('Error fetching emails:', error)
    throw createError({
      statusCode: 500,
      message: 'E-postalar getirilirken bir hata oluştu',
    })
  }
})