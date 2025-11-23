import { connectDB } from '../../utils/mongoose'
import { User } from '../../models/User'
import { generateToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const body = await readBody(event)

    // Find user with password
    const user = await User.findOne({ email: body.email }).select('+password')
    
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'E-posta veya şifre hatalı',
      })
    }

    // Check if user is active
    if (!user.isActive) {
      throw createError({
        statusCode: 401,
        message: 'Hesabınız pasif durumda',
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(body.password)
    
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        message: 'E-posta veya şifre hatalı',
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    // Set cookie
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    })

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    return {
      success: true,
      data: {
        user: userResponse,
        token,
      },
      message: 'Giriş başarılı',
    }
  } catch (error) {
    console.error('Error logging in:', error)
    throw createError({
      statusCode: 401,
      message: error instanceof Error ? error.message : 'Giriş sırasında bir hata oluştu',
    })
  }
})