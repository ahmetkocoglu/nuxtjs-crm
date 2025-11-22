import { connectDB } from '../../utils/mongoose'
import { Customer } from '../../models/Customer'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const id = getRouterParam(event, 'id')
    
    const customer = await Customer.findById(id)
    
    if (!customer) {
      throw createError({
        statusCode: 404,
        message: 'Müşteri bulunamadı',
      })
    }
    
    return {
      success: true,
      data: customer,
    }
  } catch (error) {
    console.error('Error fetching customer:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Müşteri getirilirken bir hata oluştu',
    })
  }
})