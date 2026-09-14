import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import { env } from './env.js'

dotenv.config()

cloudinary.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

export const profileMediaUploadOptions = {
  folder: 'Connectify/profiles',
  resource_type: 'image' as const,
}

export default cloudinary

