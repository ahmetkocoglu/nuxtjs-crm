import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['task', 'deal', 'activity', 'email', 'system', 'reminder'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  icon: {
    type: String,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  relatedModel: {
    type: String,
    enum: ['Customer', 'Deal', 'Task', 'Activity', 'Email'],
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
  },
}, {
  timestamps: true,
})

// Index for faster queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema)