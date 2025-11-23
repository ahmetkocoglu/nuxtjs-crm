export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Lütfen giriş yapın',
      })
    }

    return {
      success: true,
      data: user,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    throw createError({
      statusCode: 401,
      message: error instanceof Error ? error.message : 'Kullanıcı bilgisi alınamadı',
    })
  }
})