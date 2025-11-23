import { connectDB } from '../../utils/mongoose'
import { Deal } from '../../models/Deal'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const query = getQuery(event)
    const period = query.period || 'month' // day, week, month, year
    const year = query.year ? parseInt(query.year as string) : new Date().getFullYear()
    const month = query.month ? parseInt(query.month as string) - 1 : new Date().getMonth()

    let startDate: Date
    let endDate = new Date()
    let groupFormat: any

    switch (period) {
      case 'day':
        // Son 30 gün
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)
        groupFormat = {
          year: { $year: '$actualCloseDate' },
          month: { $month: '$actualCloseDate' },
          day: { $dayOfMonth: '$actualCloseDate' },
        }
        break
      case 'week':
        // Son 12 hafta
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 84)
        groupFormat = {
          year: { $year: '$actualCloseDate' },
          week: { $week: '$actualCloseDate' },
        }
        break
      case 'year':
        // Son 5 yıl
        startDate = new Date()
        startDate.setFullYear(startDate.getFullYear() - 5)
        groupFormat = {
          year: { $year: '$actualCloseDate' },
        }
        break
      default: // month
        // Son 12 ay
        startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 12)
        groupFormat = {
          year: { $year: '$actualCloseDate' },
          month: { $month: '$actualCloseDate' },
        }
    }

    // Kazanılan fırsatlar zaman serisi
    const salesTimeSeries = await Deal.aggregate([
      {
        $match: {
          stage: 'won',
          actualCloseDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$value' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
    ])

    // Kaybedilen fırsatlar
    const lostDeals = await Deal.aggregate([
      {
        $match: {
          stage: 'lost',
          actualCloseDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
          lostValue: { $sum: '$value' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
    ])

    // Kaybedilen fırsatlar - nedenler
    const lostReasons = await Deal.aggregate([
      {
        $match: {
          stage: 'lost',
          lostReason: { $exists: true, $ne: '' },
        },
      },
      {
        $group: {
          _id: '$lostReason',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    // Dönüşüm hunisi (Conversion Funnel)
    const funnelData = await Deal.aggregate([
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
        },
      },
    ])

    // Ortalama fırsat değeri
    const avgDealValue = await Deal.aggregate([
      { $match: { stage: 'won' } },
      {
        $group: {
          _id: null,
          avgValue: { $avg: '$value' },
        },
      },
    ])

    // Ortalama kapanış süresi
    const avgClosingTime = await Deal.aggregate([
      { 
        $match: { 
          stage: { $in: ['won', 'lost'] },
          actualCloseDate: { $exists: true },
        } 
      },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ['$actualCloseDate', '$createdAt'] },
              1000 * 60 * 60 * 24, // Convert to days
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' },
        },
      },
    ])

    return {
      success: true,
      data: {
        salesTimeSeries,
        lostDeals,
        lostReasons,
        funnelData,
        avgDealValue: avgDealValue[0]?.avgValue || 0,
        avgClosingTime: avgClosingTime[0]?.avgDuration || 0,
      },
    }
  } catch (error) {
    console.error('Error fetching sales analytics:', error)
    throw createError({
      statusCode: 500,
      message: 'Satış istatistikleri alınırken bir hata oluştu',
    })
  }
})