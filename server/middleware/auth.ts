import { verifyToken } from '../utils/jwt'
import { User } from '../models/User'
import { connectDB } from '../utils/mongoose'

export default defineEventHandler(async (event) => {
  // Skip auth for public routes
  const publicRoutes = ['/api/auth/login', '/api/auth/register']
  if (publicRoutes.includes(event.path)) {
    return
  }

  // Skip auth for non-API routes
  if (!event.path.startsWith('/api/')) {
    return
  }

  try {
    // Get token from cookie or header
    const token = getCookie(event, 'auth_token') || 
                  event.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      throw createError({
        statusCode: 401,
        message: 'Lütfen giriş yapın',
      })
    }

    // Verify token
    const decoded = verifyToken(token)

    // Get user from database
    await connectDB()
    const user = await User.findById(decoded.userId).select('-password')

    if (!user || !user.isActive) {
      throw createError({
        statusCode: 401,
        message: 'Kullanıcı bulunamadı veya pasif',
      })
    }

    // Attach user to event context
    event.context.user = user

  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid or expired token') {
      throw createError({
        statusCode: 401,
        message: 'Oturum süresi dolmuş, lütfen tekrar giriş yapın',
      })
    }
    throw error
  }
})