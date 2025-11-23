import { connectDB } from '../../utils/mongoose'
import { Activity } from '../../models/Activity'
import { generateExcel, generateCSV } from '../../utils/export'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const query = getQuery(event)
    const format = (query.format as string) || 'excel'
    const type = query.type as string

    // Build filter
    const filter: any = {}
    if (type) filter.type = type

    // Fetch activities
    const activities = await Activity.find(filter)
      .populate('customer', 'firstName lastName company')
      .sort({ createdAt: -1 })
      .limit(1000)

    // Prepare data
    const data = activities.map((activity) => ({
      type: getTypeText(activity.type),
      subject: activity.subject,
      customer: `${activity.customer.firstName} ${activity.customer.lastName}`,
      company: activity.customer.company || '',
      description: activity.description || '',
      duration: activity.duration || '',
      outcome: activity.outcome ? getOutcomeText(activity.outcome) : '',
      createdBy: activity.createdBy || '',
      createdAt: new Date(activity.createdAt).toLocaleDateString('tr-TR'),
    }))

    // Define columns
    const columns = [
      { header: 'Tip', key: 'type', width: 15 },
      { header: 'Konu', key: 'subject', width: 30 },
      { header: 'Müşteri', key: 'customer', width: 20 },
      { header: 'Şirket', key: 'company', width: 20 },
      { header: 'Açıklama', key: 'description', width: 40 },
      { header: 'Süre (dk)', key: 'duration', width: 12 },
      { header: 'Sonuç', key: 'outcome', width: 15 },
      { header: 'Oluşturan', key: 'createdBy', width: 20 },
      { header: 'Tarih', key: 'createdAt', width: 15 },
    ]

    if (format === 'csv') {
      const csv = generateCSV(data, columns)
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="aktiviteler-${Date.now()}.csv"`,
        },
      })
    } else {
      const buffer = await generateExcel(data, columns, 'Aktiviteler')
      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="aktiviteler-${Date.now()}.xlsx"`,
        },
      })
    }
  } catch (error) {
    console.error('Error exporting activities:', error)
    throw createError({
      statusCode: 500,
      message: 'Aktiviteler dışa aktarılırken bir hata oluştu',
    })
  }
})

function getTypeText(type: string) {
  const texts: any = {
    call: 'Telefon Görüşmesi',
    email: 'E-posta',
    meeting: 'Toplantı',
    note: 'Not',
    task: 'Görev',
    deal: 'Fırsat',
  }
  return texts[type] || type
}

function getOutcomeText(outcome: string) {
  const texts: any = {
    successful: 'Başarılı',
    unsuccessful: 'Başarısız',
    pending: 'Beklemede',
    scheduled: 'Planlandı',
  }
  return texts[outcome] || outcome
}