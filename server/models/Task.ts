import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  assignedTo: {
    type: String, // İleride kullanıcı sistemi eklendiğinde ObjectId'ye çevrilebilir
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
})

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema)