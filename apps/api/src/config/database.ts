import mongoose from 'mongoose'

import { logger } from '../core/logger/logger.js'
import { env } from './env.js'

export async function connectDatabase() {
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(env.MONGODB_URI)
    console.log("Db connection established");
    
    logger.info('MongoDB connected successfully', {
      database: mongoose.connection.name,
      host: mongoose.connection.host,
    })
  } catch (error) {
    const message =
      'MongoDB connection failed. Make sure MongoDB is running and your MONGODB_URI is set correctly.'

    logger.error(message, {
      uri: env.MONGODB_URI,
      error,
    })
    throw error
  }
}
