import { connectDB } from '../../utils/mongoose'
import { Deal } from '../../models/Deal'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    // Eğer fırsat kazanıldı veya kaybedildi ise, kapanış tarihini ekle
    if ((body.stage === 'won' || body.stage === 'lost') && !body.actualCloseDate) {
      body.actualCloseDate = new Date()
    }

    const deal = await Deal.findByIdAndUpdate(id, body, { new: true })
      .populate('customer', 'firstName lastName email company')

    if (!deal) {
      throw createError({
        statusCode: 404,
        message: 'Fırsat bulunamadı',
      })
    }

    return {
      success: true,
      data: deal,
      message: 'Fırsat başarıyla güncellendi',
    }
  } catch (error) {
    console.error('Error updating deal:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Fırsat güncellenirken bir hata oluştu',
    })
  }
})