import { connectDB } from '../../utils/mongoose'
import { Deal } from '../../models/Deal'
import { generateExcel, generateCSV } from '../../utils/export'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const query = getQuery(event)
    const format = (query.format as string) || 'excel'
    const stage = query.stage as string

    // Build filter
    const filter: any = {}
    if (stage) filter.stage = stage

    // Fetch deals
    const deals = await Deal.find(filter)
      .populate('customer', 'firstName lastName company')
      .sort({ createdAt: -1 })

    // Prepare data
    const data = deals.map((deal) => ({
      title: deal.title,
      customer: `${deal.customer.firstName} ${deal.customer.lastName}`,
      company: deal.customer.company || '',
      value: deal.value,
      currency: deal.currency,
      stage: getStageText(deal.stage),
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate
        ? new Date(deal.expectedCloseDate).toLocaleDateString('tr-TR')
        : '',
      actualCloseDate: deal.actualCloseDate
        ? new Date(deal.actualCloseDate).toLocaleDateString('tr-TR')
        : '',
      createdAt: new Date(deal.createdAt).toLocaleDateString('tr-TR'),
    }))

    // Define columns
    const columns = [
      { header: 'Başlık', key: 'title', width: 25 },
      { header: 'Müşteri', key: 'customer', width: 20 },
      { header: 'Şirket', key: 'company', width: 20 },
      { header: 'Tutar', key: 'value', width: 15 },
      { header: 'Para Birimi', key: 'currency', width: 12 },
      { header: 'Aşama', key: 'stage', width: 15 },
      { header: 'Olasılık (%)', key: 'probability', width: 12 },
      { header: 'Beklenen Kapanış', key: 'expectedCloseDate', width: 18 },
      { header: 'Gerçek Kapanış', key: 'actualCloseDate', width: 18 },
      { header: 'Oluşturma Tarihi', key: 'createdAt', width: 18 },
    ]

    if (format === 'csv') {
      const csv = generateCSV(data, columns)
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="firsatlar-${Date.now()}.csv"`,
        },
      })
    } else {
      const buffer = await generateExcel(data, columns, 'Fırsatlar')
      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="firsatlar-${Date.now()}.xlsx"`,
        },
      })
    }
  } catch (error) {
    console.error('Error exporting deals:', error)
    throw createError({
      statusCode: 500,
      message: 'Fırsatlar dışa aktarılırken bir hata oluştu',
    })
  }
})

function getStageText(stage: string) {
  const texts: any = {
    lead: 'Lead',
    qualified: 'Kalifiye',
    proposal: 'Teklif',
    negotiation: 'Müzakere',
    won: 'Kazanıldı',
    lost: 'Kaybedildi',
  }
  return texts[stage] || stage
}