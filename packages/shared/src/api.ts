import { z } from 'zod';

export const GenderSchema = z.enum([
  'male',
  'female',
  'non-binary',
  'prefer-not-to-say',
]);

export const UserSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  isEmailVerified: z.boolean(),
  createdAt: z.string().datetime(),
});

export const ProfileSchema = z.object({
  userId: z.string(),
  fullName: z.string(),
  age: z.number().int().min(18).max(100),
  gender: GenderSchema,
  location: z.string(),
  // Both optional/loosely typed to match the actual Mongoose model
  // (`occupation` isn't required, `profilePicture` isn't guaranteed to be
  // a strictly well-formed URL) — a single non-conforming profile used to
  // fail this schema and silently drop the *entire* page of results it was
  // on, which is why pagination looked like it was missing users.
  occupation: z.string().optional().default(''),
  about: z.string(),
  interest: z.array(z.string()),
  interests: z.array(z.string()).default([]),
  profilePicture: z.string().nullable(),
  // Full gallery, main photo first (photos[0] === profilePicture). Optional
  // so older cached responses without it still validate.
  photos: z.array(z.string()).optional().default([]),
  isComplete: z.boolean(),
});

export const DiscoverProfileSchema = ProfileSchema.extend({
  id: z.string(),
  distanceLabel: z.string().optional(),
  joinedDaysAgo: z.number().int().nonnegative(),
});

export const ProfileListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    message: z.string(),
    status: z.literal('success'),
    items: z.array(DiscoverProfileSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  }),
});

export const LikeSchema = z.object({
  id: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
  createdAt: z.string().datetime(),
});

export const MatchSchema = z.object({
  id: z.string(),
  userAId: z.string(),
  userBId: z.string(),
  matchedAt: z.string().datetime(),
});

export const MessageSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  senderId: z.string(),
  text: z.string(),
  sentAt: z.string().datetime(),
});

export const ConversationSchema = z.object({
  matchId: z.string(),
  otherUser: DiscoverProfileSchema,
  lastMessage: MessageSchema.nullable(),
});

export const HealthChecksSchema = z.object({
  api: z.enum(['ok', 'error']),
  database: z.enum(['ok', 'not-configured', 'error']),
  cache: z.enum(['ok', 'not-configured', 'error']),
  queue: z.enum(['ok', 'not-configured', 'error']),
});

export const HealthStatusSchema = z.object({
  status: z.enum(['alive', 'ready']),
  checks: HealthChecksSchema.optional(),
});

export const ApiErrorDetailsSchema = z.record(z.string(), z.unknown());

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  requestId: z.string().uuid().optional(),
  details: ApiErrorDetailsSchema.default({}),
});

export const ApiErrorEnvelopeSchema = z.object({
  error: ApiErrorSchema,
});

export const LikeActionResultSchema = z.object({
  liked: z.boolean(),
  matched: z.boolean(),
  conversationId: z.string(),
});

export const parseApiResponse = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  payload: unknown,
): z.infer<TSchema> => schema.parse(payload);

export const PaginatedResponseSchema = <TSchema extends z.ZodTypeAny>(
  itemSchema: TSchema,
) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  });

export const ApiSuccessEnvelopeSchema = <TSchema extends z.ZodTypeAny>(
  dataSchema: TSchema,
) =>
  z.object({
    data: dataSchema,
  });

export type ApiError = z.infer<typeof ApiErrorSchema>;
export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelopeSchema>;
export type ApiSuccessResponse<T> = { data: T };
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
export type User = z.infer<typeof UserSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type DiscoverProfile = z.infer<typeof DiscoverProfileSchema>;
export type Like = z.infer<typeof LikeSchema>;
export type Match = z.infer<typeof MatchSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type HealthStatus = z.infer<typeof HealthStatusSchema>;
export type HealthChecks = z.infer<typeof HealthChecksSchema>;
export type LikeActionResult = z.infer<typeof LikeActionResultSchema>;
