import { connectDB } from '../../utils/mongoose'
import { Task } from '../../models/Task'
import { generateExcel, generateCSV } from '../../utils/export'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const query = getQuery(event)
    const format = (query.format as string) || 'excel'
    const status = query.status as string

    // Build filter
    const filter: any = {}
    if (status) filter.status = status

    // Fetch tasks
    const tasks = await Task.find(filter)
      .populate('customer', 'firstName lastName company')
      .sort({ dueDate: 1 })

    // Prepare data
    const data = tasks.map((task) => ({
      title: task.title,
      customer: `${task.customer.firstName} ${task.customer.lastName}`,
      company: task.customer.company || '',
      status: getStatusText(task.status),
      priority: getPriorityText(task.priority),
      dueDate: new Date(task.dueDate).toLocaleDateString('tr-TR'),
      assignedTo: task.assignedTo || '',
      completedAt: task.completedAt ? new Date(task.completedAt).toLocaleDateString('tr-TR') : '',
      createdAt: new Date(task.createdAt).toLocaleDateString('tr-TR'),
    }))

    // Define columns
    const columns = [
      { header: 'Başlık', key: 'title', width: 30 },
      { header: 'Müşteri', key: 'customer', width: 20 },
      { header: 'Şirket', key: 'company', width: 20 },
      { header: 'Durum', key: 'status', width: 15 },
      { header: 'Öncelik', key: 'priority', width: 12 },
      { header: 'Son Tarih', key: 'dueDate', width: 15 },
      { header: 'Atanan', key: 'assignedTo', width: 20 },
      { header: 'Tamamlanma', key: 'completedAt', width: 15 },
      { header: 'Oluşturma', key: 'createdAt', width: 15 },
    ]

    if (format === 'csv') {
      const csv = generateCSV(data, columns)
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="gorevler-${Date.now()}.csv"`,
        },
      })
    } else {
      const buffer = await generateExcel(data, columns, 'Görevler')
      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="gorevler-${Date.now()}.xlsx"`,
        },
      })
    }
  } catch (error) {
    console.error('Error exporting tasks:', error)
    throw createError({
      statusCode: 500,
      message: 'Görevler dışa aktarılırken bir hata oluştu',
    })
  }
})

function getStatusText(status: string) {
  const texts: any = {
    pending: 'Bekliyor',
    'in-progress': 'Devam Ediyor',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
  }
  return texts[status] || status
}

function getPriorityText(priority: string) {
  const texts: any = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek',
    urgent: 'Acil',
  }
  return texts[priority] || priority
}