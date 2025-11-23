import { connectDB } from '../../utils/mongoose'
import { Task } from '../../models/Task'
import { createNotification } from '../../utils/notifications'
import { requirePermission } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    requirePermission(event.context.user, 'tasks', 'create')
    
    const body = await readBody(event)
    
    const task = new Task(body)
    await task.save()
    
    await task.populate('customer', 'firstName lastName email company')
    
    // Bildirim oluştur
    if (body.assignedTo) {
      await createNotification({
        userId: event.context.user._id, // veya atanan kişinin ID'si
        type: 'task',
        title: 'Yeni Görev Atandı',
        message: `"${task.title}" görevi oluşturuldu`,
        link: `/tasks`,
        priority: task.priority === 'urgent' ? 'high' : 'medium',
        relatedModel: 'Task',
        relatedId: task._id.toString(),
      })
    }
    
    return {
      success: true,
      data: task,
      message: 'Görev başarıyla oluşturuldu',
    }
  } catch (error) {
    console.error('Error creating task:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Görev oluşturulurken bir hata oluştu',
    })
  }
})