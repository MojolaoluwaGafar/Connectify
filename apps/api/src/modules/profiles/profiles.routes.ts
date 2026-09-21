import { Router } from 'express';

import { profilesController } from './profiles.controller.js';
import { authMiddleware } from '../../core/middleware/auth.js';

export const profilesRouter = Router();

import multer from 'multer';

const profileImageUpload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (_request, file, callback) => {
		callback(null, file.mimetype === 'image/png' || file.mimetype === 'image/jpeg');
	},
});
profilesRouter.get('/',authMiddleware, profilesController.list)
profilesRouter.get('/me/profile', authMiddleware, profilesController.getMe)
profilesRouter.get('/:profileId', authMiddleware, profilesController.getById)
profilesRouter.post(
	'/createProfile',
	authMiddleware,
	profileImageUpload.single('profilePicture'),
	profilesController.create,
)
