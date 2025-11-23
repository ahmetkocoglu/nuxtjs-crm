import { connectDB } from '../../utils/mongoose'
import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const body = await readBody(event)
    const userId = event.context.user._id

    const user = await User.findById(userId).select('+password')

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'Kullanıcı bulunamadı',
      })
    }

    // Check current password
    const isPasswordValid = await user.comparePassword(body.currentPassword)
    
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        message: 'Mevcut şifre hatalı',
      })
    }

    // Update password
    user.password = body.newPassword
    await user.save()

    return {
      success: true,
      message: 'Şifre başarıyla değiştirildi',
    }
  } catch (error) {
    console.error('Error changing password:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Şifre değiştirilirken bir hata oluştu',
    })
  }
})