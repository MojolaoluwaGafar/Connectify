declare module 'multer-storage-cloudinary' {
  import type { v2 as cloudinary } from 'cloudinary'
  import type { StorageEngine } from 'multer'
  import type { Request } from 'express'

  interface CloudinaryStorageOptions {
    cloudinary: typeof cloudinary
    params?: (
      req: Request,
      file: Express.Multer.File,
    ) => Record<string, unknown> | Promise<Record<string, unknown>>
  }

  const cloudinaryStorage: (
    options: CloudinaryStorageOptions,
  ) => StorageEngine

  export default cloudinaryStorage
}