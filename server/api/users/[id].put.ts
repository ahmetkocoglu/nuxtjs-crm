import { connectDB } from '../../utils/mongoose'
import { User } from '../../models/User'
import { requirePermission } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    // Check permission
    await requirePermission(event.context.user, 'users', 'edit')

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    // Don't allow password update through this endpoint
    delete body.password

    const user = await User.findByIdAndUpdate(id, body, { new: true }).select('-password')

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'Kullanıcı bulunamadı',
      })
    }

    return {
      success: true,
      data: user,
      message: 'Kullanıcı başarıyla güncellendi',
    }
  } catch (error) {
    console.error('Error updating user:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Kullanıcı güncellenirken bir hata oluştu',
    })
  }
})