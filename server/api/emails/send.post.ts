import { connectDB } from '../../utils/mongoose'
import { Email } from '../../models/Email'
import { Customer } from '../../models/Customer'
import { Activity } from '../../models/Activity'
import { sendEmail } from '../../utils/email'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const body = await readBody(event)
    
    // Müşteriyi bul
    const customer = await Customer.findById(body.customer)
    if (!customer) {
      throw createError({
        statusCode: 404,
        message: 'Müşteri bulunamadı',
      })
    }
    
    // E-posta kaydı oluştur
    const email = new Email({
      customer: body.customer,
      to: body.to || [customer.email],
      cc: body.cc,
      bcc: body.bcc,
      subject: body.subject,
      body: body.body,
      template: body.template,
      deal: body.deal,
      task: body.task,
      sentBy: body.sentBy,
      status: body.scheduled ? 'scheduled' : 'draft',
      scheduledAt: body.scheduledAt,
    })
    
    // Hemen gönder (scheduled değilse)
    if (!body.scheduled) {
      try {
        await sendEmail({
          to: email.to,
          cc: email.cc,
          bcc: email.bcc,
          subject: email.subject,
          html: email.body,
        })
        
        email.status = 'sent'
        email.sentAt = new Date()
        
        // Aktivite kaydı oluştur
        await Activity.create({
          customer: customer._id,
          deal: body.deal,
          task: body.task,
          type: 'email',
          subject: `E-posta Gönderildi: ${email.subject}`,
          description: `${customer.email} adresine e-posta gönderildi`,
          outcome: 'successful',
          completedDate: new Date(),
          createdBy: body.sentBy,
        })
        
      } catch (error) {
        email.status = 'failed'
        email.error = error instanceof Error ? error.message : 'E-posta gönderilemedi'
      }
    }
    
    await email.save()
    await email.populate('customer', 'firstName lastName email company')
    
    return {
      success: true,
      data: email,
      message: email.status === 'sent' ? 'E-posta başarıyla gönderildi' : 'E-posta kaydedildi',
    }
  } catch (error) {
    console.error('Error sending email:', error)
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'E-posta gönderilirken bir hata oluştu',
    })
  }
})