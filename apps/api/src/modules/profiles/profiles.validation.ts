import { z } from 'zod';

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const profilePictureSchema = z
  .string()
  .nullable()
  .refine(
    (value) => value === null || z.string().url().safeParse(value).success,
    'Profile picture must be a valid hosted URL.',
  );

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