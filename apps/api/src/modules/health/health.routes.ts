import { Router } from 'express'

export const healthRouter = Router()

healthRouter.get('/live', (_request, response) => {
  response.status(200).json({ status: 'alive' })
})

healthRouter.get('/ready', (_request, response) => {
  response.status(200).json({
    status: 'ready',
    checks: {
      api: 'ok',
      database: 'not-configured',
      cache: 'not-configured',
      queue: 'not-configured',
    },
  })
})
