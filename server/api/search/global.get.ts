import { connectDB } from '../../utils/mongoose'
import { Customer } from '../../models/Customer'
import { Deal } from '../../models/Deal'
import { Task } from '../../models/Task'
import { Activity } from '../../models/Activity'
import { Email } from '../../models/Email'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const query = getQuery(event)
    const searchTerm = query.q as string
    const limit = parseInt((query.limit as string) || '10')

    if (!searchTerm || searchTerm.length < 2) {
      return {
        success: true,
        data: {
          customers: [],
          deals: [],
          tasks: [],
          activities: [],
          emails: [],
          total: 0,
        },
      }
    }

    // Create search regex (case-insensitive)
    const searchRegex = new RegExp(searchTerm, 'i')

    // Search in parallel
    const [customers, deals, tasks, activities, emails] = await Promise.all([
      // Customers
      Customer.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { company: searchRegex },
        ],
      })
        .select('firstName lastName email company status')
        .limit(limit),

      // Deals
      Deal.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
        ],
      })
        .populate('customer', 'firstName lastName company')
        .select('title value currency stage customer')
        .limit(limit),

      // Tasks
      Task.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
        ],
      })
        .populate('customer', 'firstName lastName company')
        .select('title status priority dueDate customer')
        .limit(limit),

      // Activities
      Activity.find({
        $or: [
          { subject: searchRegex },
          { description: searchRegex },
        ],
      })
        .populate('customer', 'firstName lastName company')
        .select('type subject outcome createdAt customer')
        .limit(limit),

      // Emails
      Email.find({
        $or: [
          { subject: searchRegex },
          { body: searchRegex },
        ],
      })
        .populate('customer', 'firstName lastName company')
        .select('subject status sentAt customer')
        .limit(limit),
    ])

    const total =
      customers.length +
      deals.length +
      tasks.length +
      activities.length +
      emails.length

    return {
      success: true,
      data: {
        customers,
        deals,
        tasks,
        activities,
        emails,
        total,
        searchTerm,
      },
    }
  } catch (error) {
    console.error('Error in global search:', error)
    throw createError({
      statusCode: 500,
      message: 'Arama sırasında bir hata oluştu',
    })
  }
})