import { connectDB } from '../../utils/mongoose'
import { Customer } from '../../models/Customer'
import { Deal } from '../../models/Deal'
import { Task } from '../../models/Task'
import { Activity } from '../../models/Activity'
import { Email } from '../../models/Email'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Temel sayılar
    const totalCustomers = await Customer.countDocuments()
    const totalDeals = await Deal.countDocuments()
    const totalTasks = await Task.countDocuments()
    const totalActivities = await Activity.countDocuments()

    // Aktif sayılar
    const activeDeals = await Deal.countDocuments({ 
      stage: { $nin: ['won', 'lost'] } 
    })
    const activeTasks = await Task.countDocuments({ 
      status: { $nin: ['completed', 'cancelled'] } 
    })

    // Müşteri durumları
    const customersByStatus = await Customer.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ])

    // Fırsat aşamaları
    const dealsByStage = await Deal.aggregate([
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
        },
      },
    ])

    // Görev durumları
    const tasksByStatus = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ])

    // Aktivite tipleri
    const activitiesByType = await Activity.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ])

    // Toplam gelir (kazanılan fırsatlar)
    const wonDeals = await Deal.aggregate([
      { $match: { stage: 'won' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$value' },
          count: { $sum: 1 },
        },
      },
    ])

    // Pipeline değeri (aktif fırsatlar)
    const pipelineValue = await Deal.aggregate([
      { $match: { stage: { $nin: ['won', 'lost'] } } },
      {
        $group: {
          _id: null,
          total: { 
            $sum: { 
              $multiply: ['$value', { $divide: ['$probability', 100] }] 
            } 
          },
        },
      },
    ])

    // Son 30 günde eklenen müşteriler
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)
    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: last30Days },
    })

    // Başarı oranı
    const closedDeals = await Deal.countDocuments({ 
      stage: { $in: ['won', 'lost'] } 
    })
    const wonDealsCount = await Deal.countDocuments({ stage: 'won' })
    const winRate = closedDeals > 0 ? (wonDealsCount / closedDeals) * 100 : 0

    return {
      success: true,
      data: {
        overview: {
          totalCustomers,
          totalDeals,
          totalTasks,
          totalActivities,
          activeDeals,
          activeTasks,
          newCustomers,
          totalRevenue: wonDeals[0]?.total || 0,
          wonDealsCount: wonDeals[0]?.count || 0,
          pipelineValue: pipelineValue[0]?.total || 0,
          winRate: Math.round(winRate),
        },
        customersByStatus,
        dealsByStage,
        tasksByStatus,
        activitiesByType,
      },
    }
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    throw createError({
      statusCode: 500,
      message: 'Dashboard istatistikleri alınırken bir hata oluştu',
    })
  }
})