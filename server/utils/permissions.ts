export const checkPermission = (user: any, module: string, action: string): boolean => {
  if (!user || !user.permissions) return false
  
  // Admin has all permissions
  if (user.role === 'admin') return true
  
  // Check specific permission
  return user.permissions[module]?.[action] === true
}

export const requirePermission = (user: any, module: string, action: string) => {
  if (!checkPermission(user, module, action)) {
    throw createError({
      statusCode: 403,
      message: 'Bu işlem için yetkiniz bulunmamaktadır',
    })
  }
}