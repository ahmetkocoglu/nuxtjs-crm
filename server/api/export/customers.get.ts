import { connectDB } from '../../utils/mongoose'
import { Customer } from '../../models/Customer'
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

    // Fetch customers
    const customers = await Customer.find(filter).sort({ createdAt: -1 })

    // Prepare data
    const data = customers.map((customer) => ({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.company || '',
      status: getStatusText(customer.status),
      createdAt: new Date(customer.createdAt).toLocaleDateString('tr-TR'),
    }))

    // Define columns
    const columns = [
      { header: 'Ad', key: 'firstName', width: 15 },
      { header: 'Soyad', key: 'lastName', width: 15 },
      { header: 'E-posta', key: 'email', width: 25 },
      { header: 'Telefon', key: 'phone', width: 15 },
      { header: 'Şirket', key: 'company', width: 20 },
      { header: 'Durum', key: 'status', width: 15 },
      { header: 'Kayıt Tarihi', key: 'createdAt', width: 15 },
    ]

    if (format === 'csv') {
      const csv = generateCSV(data, columns)
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="musteriler-${Date.now()}.csv"`,
        },
      })
    } else {
      const buffer = await generateExcel(data, columns, 'Müşteriler')
      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="musteriler-${Date.now()}.xlsx"`,
        },
      })
    }
  } catch (error) {
    console.error('Error exporting customers:', error)
    throw createError({
      statusCode: 500,
      message: 'Müşteriler dışa aktarılırken bir hata oluştu',
    })
  }
})

function getStatusText(status: string) {
  const texts: any = {
    lead: 'Lead',
    prospect: 'Prospect',
    customer: 'Müşteri',
    inactive: 'Pasif',
  }
  return texts[status] || status
}