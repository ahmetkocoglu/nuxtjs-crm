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
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Set default permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'admin':
        // Admin has all permissions
        Object.keys(this.permissions).forEach(module => {
          Object.keys(this.permissions[module as keyof typeof this.permissions]).forEach(action => {
            // @ts-ignore
            this.permissions[module][action] = true
          })
        })
        break
      case 'manager':
        // Manager has most permissions except user management
        Object.keys(this.permissions).forEach(module => {
          if (module !== 'users') {
            Object.keys(this.permissions[module as keyof typeof this.permissions]).forEach(action => {
              // @ts-ignore
              this.permissions[module][action] = true
            })
          }
        })
        this.permissions.users.view = true
        break
      case 'sales':
        // Sales can view, create, edit but not delete
        Object.keys(this.permissions).forEach(module => {
          if (module !== 'users') {
            // @ts-ignore
            this.permissions[module].view = true
            // @ts-ignore
            this.permissions[module].create = true
            // @ts-ignore
            this.permissions[module].edit = true
            // @ts-ignore
            this.permissions[module].delete = false
          }
        })
        break
      case 'support':
        // Support can only view and create activities
        this.permissions.customers.view = true
        this.permissions.activities.view = true
        this.permissions.activities.create = true
        this.permissions.tasks.view = true
        break
    }
  }
  next()
})

export const User = mongoose.models.User || mongoose.model('User', userSchema)