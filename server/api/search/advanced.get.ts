import { connectDB } from '../../utils/mongoose'
import { Customer } from '../../models/Customer'
import { Deal } from '../../models/Deal'
import { Task } from '../../models/Task'
import { Activity } from '../../models/Activity'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const query = getQuery(event)
    const searchTerm = query.q as string
    const type = query.type as string // customers, deals, tasks, activities
    const dateFrom = query.dateFrom as string
    const dateTo = query.dateTo as string
    const status = query.status as string
    const limit = parseInt((query.limit as string) || '50')

    if (!searchTerm || searchTerm.length < 2) {
      return {
        success: true,
        data: [],
        total: 0,
      }
    }

    const searchRegex = new RegExp(searchTerm, 'i')
    let results: any[] = []
    let totalCount = 0

    // Build date filter
    const dateFilter: any = {}
    if (dateFrom) dateFilter.$gte = new Date(dateFrom)
    if (dateTo) dateFilter.$lte = new Date(dateTo)

    switch (type) {
      case 'customers':
        const customerFilter: any = {
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { company: searchRegex },
          ],
        }
        if (status) customerFilter.status = status
        if (Object.keys(dateFilter).length) customerFilter.createdAt = dateFilter

        results = await Customer.find(customerFilter)
          .select('firstName lastName email phone company status createdAt')
          .sort({ createdAt: -1 })
          .limit(limit)

        totalCount = await Customer.countDocuments(customerFilter)
        break

      case 'deals':
        const dealFilter: any = {
          $or: [{ title: searchRegex }, { description: searchRegex }],
        }
        if (status) dealFilter.stage = status
        if (Object.keys(dateFilter).length) dealFilter.createdAt = dateFilter

        results = await Deal.find(dealFilter)
          .populate('customer', 'firstName lastName company')
          .select('title value currency stage probability customer createdAt')
          .sort({ createdAt: -1 })
          .limit(limit)

        totalCount = await Deal.countDocuments(dealFilter)
        break

      case 'tasks':
        const taskFilter: any = {
          $or: [{ title: searchRegex }, { description: searchRegex }],
        }
        if (status) taskFilter.status = status
        if (Object.keys(dateFilter).length) taskFilter.createdAt = dateFilter

        results = await Task.find(taskFilter)
          .populate('customer', 'firstName lastName company')
          .select('title status priority dueDate customer createdAt')
          .sort({ dueDate: 1 })
          .limit(limit)

        totalCount = await Task.countDocuments(taskFilter)
        break

      case 'activities':
        const activityFilter: any = {
          $or: [{ subject: searchRegex }, { description: searchRegex }],
        }
        if (status) activityFilter.type = status
        if (Object.keys(dateFilter).length) activityFilter.createdAt = dateFilter

        results = await Activity.find(activityFilter)
          .populate('customer', 'firstName lastName company')
          .select('type subject outcome createdAt customer')
          .sort({ createdAt: -1 })
          .limit(limit)

        totalCount = await Activity.countDocuments(activityFilter)
        break

      default:
        throw createError({
          statusCode: 400,
          message: 'Geçersiz arama tipi',
        })
    }

    return {
      success: true,
      data: results,
      total: totalCount,
      searchTerm,
      type,
    }
  } catch (error) {
    console.error('Error in advanced search:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Arama sırasında bir hata oluştu',
    })
  }
})