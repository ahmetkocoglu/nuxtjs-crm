import { connectDB } from '../../utils/mongoose'
import { User } from '../../models/User'
import { requirePermission } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    // Check permission
    requirePermission(event.context.user, 'users', 'view')

    const users = await User.find().select('-password').sort({ createdAt: -1 })

    return {
      success: true,
      data: users,
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw createError({
      statusCode: error instanceof Error && error.message.includes('yetkiniz') ? 403 : 500,
      message: error instanceof Error ? error.message : 'Kullanıcılar getirilirken bir hata oluştu',
    })
  }
})