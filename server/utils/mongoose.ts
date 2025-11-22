import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined')
    }

    if (mongoose.connection.readyState >= 1) {
      return
    }

    await mongoose.connect(mongoUri)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}