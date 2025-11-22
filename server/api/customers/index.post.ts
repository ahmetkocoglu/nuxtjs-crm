import { connectDB } from '../../utils/mongoose'
import { Customer } from '../../models/Customer'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const body = await readBody(event)
    
    const customer = new Customer(body)
    await customer.save()
    
    return {
      success: true,
      data: customer,
      message: 'Müşteri başarıyla oluşturuldu',
    }
  } catch (error: any) {
    console.error('Error creating customer:', error)
    throw createError({
      statusCode: 400,
      message: error.message || 'Müşteri oluşturulurken bir hata oluştu',
    })
  }
})