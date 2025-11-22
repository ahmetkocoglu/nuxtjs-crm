import mongoose from 'mongoose'

const emailSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  to: {
    type: [String],
    required: true,
  },
  cc: [String],
  bcc: [String],
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  template: {
    type: String,
    enum: ['welcome', 'followUp', 'dealProposal', 'taskReminder', 'custom'],
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'failed', 'scheduled'],
    default: 'draft',
  },
  sentAt: {
    type: Date,
  },
  scheduledAt: {
    type: Date,
  },
  error: {
    type: String,
  },
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  sentBy: {
    type: String,
  },
  attachments: [{
    filename: String,
    path: String,
  }],
}, {
  timestamps: true,
})

emailSchema.index({ customer: 1, createdAt: -1 })
emailSchema.index({ status: 1 })

export const Email = mongoose.models.Email || mongoose.model('Email', emailSchema)