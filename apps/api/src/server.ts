import 'dotenv/config'

import { createApp } from './app.js'
import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { logger } from './core/logger/logger.js'

const app = createApp()

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(env.PORT, () => {
      logger.info(`Connecti API listening on http://localhost:${env.PORT}`)
    })
  } catch (error) {
    logger.error(
      'Startup error. Start your local MongoDB instance (for example: mongod or npm run mongo:start) and ensure apps/api/.env contains a valid MONGODB_URI.',
      error,
    )
    process.exit(1)
  }
}

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', reason)
  process.exit(1)
})

startServer()

