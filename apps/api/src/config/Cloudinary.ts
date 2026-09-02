import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

import { env } from './env.js'

dotenv.config()

cloudinary.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "Connectify/uploads";
    let resourceType = "auto";
    return {
      folder,
      resource_type: resourceType,
    };
  },
});
export const upload = multer({ storage });
export default cloudinary;

