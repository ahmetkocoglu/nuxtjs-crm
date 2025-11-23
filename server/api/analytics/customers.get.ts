import { connectDB } from '../../utils/mongoose'
import { Customer } from '../../models/Customer'
import { Deal } from '../../models/Deal'
import { Activity } from '../../models/Activity'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Müşteri büyüme trendi (son 12 ay)
    const last12Months = new Date()
    last12Months.setMonth(last12Months.getMonth() - 12)

    const customerGrowth = await Customer.aggregate([
      {
        $match: {
          createdAt: { $gte: last12Months },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    // En değerli müşteriler (toplam fırsat değerine göre)
    const topCustomersByValue = await Deal.aggregate([
      {
        $match: {
          stage: 'won',
        },
      },
      {
        $group: {
          _id: '$customer',
          totalRevenue: { $sum: '$value' },
          dealCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
    ])

    // En aktif müşteriler (aktivite sayısına göre)
    const topCustomersByActivity = await Activity.aggregate([
      {
        $group: {
          _id: '$customer',
          activityCount: { $sum: 1 },
        },
      },
      { $sort: { activityCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
    ])

    // Müşteri segmentasyonu
    const customerSegmentation = await Customer.aggregate([
      {
        $lookup: {
          from: 'deals',
          let: { customerId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$customer', '$$customerId'] }, stage: 'won' } },
            { $group: { _id: null, totalValue: { $sum: '$value' } } },
          ],
          as: 'deals',
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          company: 1,
          status: 1,
          totalValue: { $ifNull: [{ $arrayElemAt: ['$deals.totalValue', 0] }, 0] },
        },
      },
      {
        $bucket: {
          groupBy: '$totalValue',
          boundaries: [0, 10000, 50000, 100000, 500000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            customers: { $push: '$$ROOT' },
          },
        },
      },
    ])

    // Müşteri kayıp oranı (Churn Rate)
    const totalCustomers = await Customer.countDocuments()
    const inactiveCustomers = await Customer.countDocuments({ status: 'inactive' })
    const churnRate = totalCustomers > 0 ? (inactiveCustomers / totalCustomers) * 100 : 0

    // Müşteri yaşam boyu değeri (CLV - Customer Lifetime Value)
    const clvData = await Deal.aggregate([
      {
        $match: {
          stage: 'won',
        },
      },
      {
        $group: {
          _id: '$customer',
          totalRevenue: { $sum: '$value' },
          dealCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          avgCLV: { $avg: '$totalRevenue' },
          avgDealsPerCustomer: { $avg: '$dealCount' },
        },
      },
    ])

    return {
      success: true,
      data: {
        customerGrowth,
        topCustomersByValue,
        topCustomersByActivity,
        customerSegmentation,
        churnRate,
        avgCLV: clvData[0]?.avgCLV || 0,
        avgDealsPerCustomer: clvData[0]?.avgDealsPerCustomer || 0,
      },
    }
  } catch (error) {
    console.error('Error fetching customer analytics:', error)
    throw createError({
      statusCode: 500,
      message: 'Müşteri istatistikleri alınırken bir hata oluştu',
    })
  }
})