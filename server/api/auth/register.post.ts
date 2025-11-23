import { connectDB } from '../../utils/mongoose'
import { User } from '../../models/User'
import { generateToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const body = await readBody(event)

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email })
    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: 'Bu e-posta adresi zaten kullanılıyor',
      })
    }

    // Create user
    const user = new User({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password,
      role: body.role || 'sales',
      phone: body.phone,
      department: body.department,
    })

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
      message: 'Kayıt başarılı',
    }
  } catch (error) {
    console.error('Error registering user:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Kayıt sırasında bir hata oluştu',
    })
  }
})