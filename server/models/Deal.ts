import mongoose from 'mongoose'

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'TRY',
  },
  stage: {
    type: String,
    enum: ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
    default: 'lead',
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 10,
  },
  expectedCloseDate: {
    type: Date,
  },
  actualCloseDate: {
    type: Date,
  },
  description: {
    type: String,
  },
  notes: {
    type: String,
  },
  lostReason: {
    type: String,
  },
}, {
  timestamps: true,
})

export const Deal = mongoose.models.Deal || mongoose.model('Deal', dealSchema)