import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
  },
  company: {
    type: String,
  },
  status: {
    type: String,
    enum: ['lead', 'prospect', 'customer', 'inactive'],
    default: 'lead',
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true, // Bu otomatik olarak createdAt ve updatedAt alanlarını yönetir
})

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema)