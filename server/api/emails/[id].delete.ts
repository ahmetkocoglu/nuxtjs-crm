import { connectDB } from '../../utils/mongoose'
import { Email } from '../../models/Email'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const id = getRouterParam(event, 'id')
    
    const email = await Email.findByIdAndDelete(id)
    
    if (!email) {
      throw createError({
        statusCode: 404,
        message: 'E-posta bulunamadı',
      })
    }
    
    return {
      success: true,
      message: 'E-posta başarıyla silindi',
    }
  } catch (error) {
    console.error('Error deleting email:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'E-posta silinirken bir hata oluştu',
    })
  }
})