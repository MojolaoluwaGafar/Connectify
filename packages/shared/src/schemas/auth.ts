import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string({
    message: "Complete this field to continue",
  }),
  email: z.email({
    message: "Complete this field to continue",
  }),
  password: z
    .string({
      message: "Complete this field to continue",
    })
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    })
    .regex(/\d/, {
      message: "Password must contain at least one number",
    }),
});

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
  email: z.string().email("Invalid email address").optional(),
  userId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email({ message: "Complete this field to continue" }),
  password: z
    .string({
      message: "Complete this field to continue",
    })
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    })
    .regex(/\d/, {
      message: "Password must contain at least one number",
    }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export const resetPasswordSchema = z
  .object({
    email: z.email({
      message: "Enter a valid email address",
    }),
    token: z
      .string({
        message: "Enter the reset code from your email",
      })
      .min(1, {
        message: "Enter the reset code from your email",
      }),
    newPassword: z
      .string({
        message: "Enter your new password",
      })
      .min(8, {
        message: "Password must be at least 8 characters long",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "Password must contain at least one special character",
      })
      .regex(/\d/, {
        message: "Password must contain at least one number",
      }),
    confirmPassword: z.string({
      message: "Confirm your new password",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export const resendVerificationSchema = z.object({
  email: z.email({
    message: "Enter a valid email address",
  }),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({
      message: "Enter your current password",
    }),
    newPassword: z
      .string({
        message: "Enter your new password",
      })
      .min(8, {
        message: "Password must be at least 8 characters long",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "Password must contain at least one special character",
      })
      .regex(/\d/, {
        message: "Password must contain at least one number",
      }),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyCodeInput = z.infer<typeof verifyEmailSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
