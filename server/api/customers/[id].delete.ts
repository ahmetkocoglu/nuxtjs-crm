import { connectDB } from '../../utils/mongoose'
import { Customer } from '../../models/Customer'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const id = getRouterParam(event, 'id')

    const customer = await Customer.findByIdAndDelete(id)

    if (!customer) {
      throw createError({
        statusCode: 404,
        message: 'Müşteri bulunamadı',
      })
    }

    return {
      success: true,
      message: 'Müşteri başarıyla silindi',
    }
  } catch (error: any) {
    console.error('Error deleting customer:', error)
    throw createError({
      statusCode: 400,
      message: error.message || 'Müşteri silinirken bir hata oluştu',
    })
  }
})