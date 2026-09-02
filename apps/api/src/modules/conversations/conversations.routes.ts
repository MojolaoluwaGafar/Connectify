import { Router } from 'express'

import { conversationsController } from './conversations.controller.js'

export const conversationsRouter = Router()

conversationsRouter.get('/', conversationsController.list)
conversationsRouter.get('/:conversationId/messages', conversationsController.listMessages)
conversationsRouter.post('/:conversationId/messages', conversationsController.sendMessage)
