export default defineNuxtRouteMiddleware((to) => {
  // Public routes
  const publicRoutes = ['/login', '/register']

  if (publicRoutes.includes(to.path)) {
    return
  }

  // Check if user is authenticated
  if (process.client) {
    const user = localStorage.getItem('user')
    if (!user) {
      return navigateTo('/login')
    }
  }
})