import { connectDB } from '../../utils/mongoose'
import { Deal } from '../../models/Deal'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const id = getRouterParam(event, 'id')

    const deal = await Deal.findByIdAndDelete(id)

    if (!deal) {
      throw createError({
        statusCode: 404,
        message: 'Fırsat bulunamadı',
      })
    }

    return {
      success: true,
      message: 'Fırsat başarıyla silindi',
    }
  } catch (error) {
    console.error('Error deleting deal:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Fırsat silinirken bir hata oluştu',
    })
  }
})