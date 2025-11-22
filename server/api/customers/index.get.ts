import { connectDB } from '../../utils/mongoose'
import { Customer } from '../../models/Customer'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const customers = await Customer.find().sort({ createdAt: -1 })
    return {
      success: true,
      data: customers,
    }
  } catch (error) {
    console.error('Error fetching customers:', error)
    throw createError({
      statusCode: 500,
      message: 'Müşteriler getirilirken bir hata oluştu',
    })
  }
})