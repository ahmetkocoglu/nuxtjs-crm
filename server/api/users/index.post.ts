import { connectDB } from '../../utils/mongoose'
import { User } from '../../models/User'
import { requirePermission } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    // Check permission
    requirePermission(event.context.user, 'users', 'create')

    const body = await readBody(event)

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email })
    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: 'Bu e-posta adresi zaten kullanılıyor',
      })
    }

    const user = new User(body)
    await user.save()

    const userResponse = user.toObject()
    delete userResponse.password

    return {
      success: true,
      data: userResponse,
      message: 'Kullanıcı başarıyla oluşturuldu',
    }
  } catch (error) {
    console.error('Error creating user:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Kullanıcı oluşturulurken bir hata oluştu',
    })
  }
})