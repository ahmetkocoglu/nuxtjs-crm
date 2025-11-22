import { connectDB } from '../../utils/mongoose'
import { Deal } from '../../models/Deal'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const body = await readBody(event)

    const deal = new Deal(body)
    await deal.save()

    await deal.populate('customer', 'firstName lastName email company')

    return {
      success: true,
      data: deal,
      message: 'Fırsat başarıyla oluşturuldu',
    }
  } catch (error) {
    console.error('Error creating deal:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Fırsat oluşturulurken bir hata oluştu',
    })
  }
})