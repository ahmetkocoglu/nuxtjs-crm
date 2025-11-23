import { connectDB } from '../../utils/mongoose'
import { User } from '../../models/User'
import { requirePermission } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    // Check permission
    requirePermission(event.context.user, 'users', 'delete')

    const id = getRouterParam(event, 'id')

    // Don't allow deleting yourself
    if (id === event.context.user._id.toString()) {
      throw createError({
        statusCode: 400,
        message: 'Kendi hesabınızı silemezsiniz',
      })
    }

    const user = await User.findByIdAndDelete(id)

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'Kullanıcı bulunamadı',
      })
    }

    return {
      success: true,
      message: 'Kullanıcı başarıyla silindi',
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Kullanıcı silinirken bir hata oluştu',
    })
  }
})