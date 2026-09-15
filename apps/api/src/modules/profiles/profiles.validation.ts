import { z } from 'zod';

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const dataUrlPattern = /^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/]+={0,2})$/;

const profilePictureSchema = z
  .string()
  .nullable()
  .superRefine((value, context) => {
    if (value === null) {
      return;
    }

    if (!value.startsWith('data:')) {
      if (!z.string().url().safeParse(value).success) {
        context.addIssue({
          code: 'custom',
          message: 'Profile picture must be a valid URL.',
        });
      }
      return;
    }

    const match = dataUrlPattern.exec(value);
    if (!match) {
      context.addIssue({
        code: 'custom',
        message: 'Profile image must be a PNG or JPEG data URL.',
      });
      return;
    }

    const base64 = match[2] ?? '';
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
    const byteLength = Math.floor((base64.length * 3) / 4) - padding;

    if (byteLength > MAX_PROFILE_IMAGE_BYTES) {
      context.addIssue({
        code: 'custom',
        message: 'Profile image must be 5 MB or smaller.',
      });
    }
  });

export const profileInputSchema = z.object({
  fullName: z.string().trim().min(2),
  age: z.number().int().min(18).max(100),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']),
  location: z.string().trim().min(1),
  occupation: z.string().trim(),
  about: z.string().trim().min(10),
  interests: z.array(z.string()).min(1),
  profilePicture: profilePictureSchema,
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

export { MAX_PROFILE_IMAGE_BYTES };