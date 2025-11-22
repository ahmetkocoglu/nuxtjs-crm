import { connectDB } from '../../utils/mongoose'
import { Customer } from '../../models/Customer'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    const customer = await Customer.findByIdAndUpdate(id, body, { new: true })
    
    if (!customer) {
      throw createError({
        statusCode: 404,
        message: 'Müşteri bulunamadı',
      })
    }
    
    return {
      success: true,
      data: customer,
      message: 'Müşteri başarıyla güncellendi',
    }
  } catch (error: any) {
    console.error('Error updating customer:', error)
    throw createError({
      statusCode: 400,
      message: error.message || 'Müşteri güncellenirken bir hata oluştu',
    })
  }
})