import { connectDB } from '../../utils/mongoose'
import { Activity } from '../../models/Activity'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Son 30 günde aktivite trendi
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    const activityTrend = await Activity.aggregate([
      {
        $match: {
          createdAt: { $gte: last30Days },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ])

    // Aktivite tiplerine göre dağılım
    const activitiesByType = await Activity.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])

    // Sonuçlara göre aktiviteler
    const activitiesByOutcome = await Activity.aggregate([
      {
        $match: {
          outcome: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$outcome',
          count: { $sum: 1 },
        },
      },
    ])

    // En aktif kullanıcılar
    const topUsersByActivity = await Activity.aggregate([
      {
        $match: {
          createdBy: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$createdBy',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    // Ortalama aktivite süresi (dakika cinsinden)
    const avgActivityDuration = await Activity.aggregate([
      {
        $match: {
          duration: { $exists: true, $gt: 0 },
        },
      },
      {
        $group: {
          _id: '$type',
          avgDuration: { $avg: '$duration' },
        },
      },
    ])

    return {
      success: true,
      data: {
        activityTrend,
        activitiesByType,
        activitiesByOutcome,
        topUsersByActivity,
        avgActivityDuration,
      },
    }
  } catch (error) {
    console.error('Error fetching activity analytics:', error)
    throw createError({
      statusCode: 500,
      message: 'Aktivite istatistikleri alınırken bir hata oluştu',
    })
  }
})