
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
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
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'sales', 'support'],
    default: 'sales',
  },
  avatar: {
    type: String,
  },
  phone: {
    type: String,
  },
  department: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  permissions: {
    customers: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      delete: { type: Boolean, default: false },
    },
    deals: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      delete: { type: Boolean, default: false },
    },
    tasks: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      delete: { type: Boolean, default: false },
    },
    activities: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      delete: { type: Boolean, default: false },
    },
    emails: {
      view: { type: Boolean, default: true },
      send: { type: Boolean, default: true },
      delete: { type: Boolean, default: false },
    },
    users: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
  },
}, {
  timestamps: true,
})

// Password hash middleware
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Set default permissions based on role
userSchema.pre('save', function() {
  if (!this.isModified('role')) return

  switch (this.role) {
    case 'admin':
      // Admin has all permissions
      this.permissions = {
        customers: { view: true, create: true, edit: true, delete: true },
        deals: { view: true, create: true, edit: true, delete: true },
        tasks: { view: true, create: true, edit: true, delete: true },
        activities: { view: true, create: true, edit: true, delete: true },
        emails: { view: true, send: true, delete: true },
        users: { view: true, create: true, edit: true, delete: true },
      }
      break
    case 'manager':
      // Manager has most permissions except user management
      this.permissions = {
        customers: { view: true, create: true, edit: true, delete: true },
        deals: { view: true, create: true, edit: true, delete: true },
        tasks: { view: true, create: true, edit: true, delete: true },
        activities: { view: true, create: true, edit: true, delete: true },
        emails: { view: true, send: true, delete: true },
        users: { view: true, create: false, edit: false, delete: false },
      }
      break
    case 'sales':
      // Sales can view, create, edit but not delete
      this.permissions = {
        customers: { view: true, create: true, edit: true, delete: false },
        deals: { view: true, create: true, edit: true, delete: false },
        tasks: { view: true, create: true, edit: true, delete: false },
        activities: { view: true, create: true, edit: true, delete: false },
        emails: { view: true, send: true, delete: false },
        users: { view: false, create: false, edit: false, delete: false },
      }
      break
    case 'support':
      // Support can only view and create activities
      this.permissions = {
        customers: { view: true, create: false, edit: false, delete: false },
        deals: { view: false, create: false, edit: false, delete: false },
        tasks: { view: true, create: false, edit: false, delete: false },
        activities: { view: true, create: true, edit: true, delete: false },
        emails: { view: true, send: false, delete: false },
        users: { view: false, create: false, edit: false, delete: false },
      }
      break
  }
})

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.models.User || mongoose.model('User', userSchema)