export default defineEventHandler(async (event) => {
  try {
    // Clear cookie
    deleteCookie(event, 'auth_token')

    return {
      success: true,
      message: 'Çıkış başarılı',
    }
  } catch (error) {
    console.error('Error logging out:', error)
    throw createError({
      statusCode: 400,
      message: 'Çıkış sırasında bir hata oluştu',
    })
  }
})