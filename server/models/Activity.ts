import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'note', 'task', 'deal'],
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  duration: {
    type: Number, // dakika cinsinden
  },
  outcome: {
    type: String,
    enum: ['successful', 'unsuccessful', 'pending', 'scheduled'],
  },
  scheduledDate: {
    type: Date,
  },
  completedDate: {
    type: Date,
  },
  createdBy: {
    type: String, // İleride kullanıcı sistemi için ObjectId olacak
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
  }],
}, {
  timestamps: true,
})

// Index'ler - Performans için
activitySchema.index({ customer: 1, createdAt: -1 })
activitySchema.index({ type: 1 })

export const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema)