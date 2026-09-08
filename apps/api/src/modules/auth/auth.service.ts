import bcrypt from "bcrypt";
import {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} from "@connecti/shared";
import { AppError } from "../../core/errors/app-error.js";
import { User } from "../../model/User.js";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import type { JWTPayload } from "../../types/payload.js";
import { ActivationTemplate } from "../../MailTemplates/Activate.js";
import { SendEmail } from "../../utils/SendMail.js";

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(
  email: string,
  fullName: string,
  verificationCode: string,
) {
  const firstName = fullName.trim().split(/\s+/)[0] || "there";

  await SendEmail({
    to: email,
    subject: "Verify your Connectify account",
    html: ActivationTemplate(firstName, verificationCode),
  });
}

export async function registerUser(payload: unknown) {
  const data = registerSchema.parse(payload);

  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new AppError(409, "EMAIL_ALREADY_EXISTS", "Email already in use");
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const verificationCode = generateVerificationCode();

  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

  // Development only: show verification code in backend terminal
  console.log("====================================");
  console.log("📧 VERIFICATION CODE");
  console.log(`Email: ${data.email}`);
  console.log(`Code: ${verificationCode}`);
  console.log("Expires: 10 minutes");
  console.log("====================================");

  const newUser = await User.create({
    fullName: data.fullName,
    email: data.email,
    password: hashedPassword,
    role: "user",
    isEmailVerified: false,
    verificationCode,
    verificationCodeExpires,
  });

  await sendVerificationEmail(
    newUser.email,
    newUser.fullName,
    verificationCode,
  );

  return {
    id: newUser._id,
    fullName: newUser.fullName,
    email: newUser.email,
    role: newUser.role,
  };
}

export async function verifyUserEmail(payload: unknown) {
  const data = verifyEmailSchema.parse(payload);

  const user = await User.findOne({ email: data.email });

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  if (user.isEmailVerified) {
    throw new AppError(
      400,
      "EMAIL_ALREADY_VERIFIED",
      "Email is already verified",
    );
  }

  if (user.verificationCode !== data.code) {
    throw new AppError(
      400,
      "INVALID_VERIFICATION_CODE",
      "Invalid verification code",
    );
  }

  if (
    !user.verificationCodeExpires ||
    user.verificationCodeExpires < new Date()
  ) {
    throw new AppError(
      400,
      "VERIFICATION_CODE_EXPIRED",
      "Verification code has expired",
    );
  }

  user.isEmailVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;

  await user.save();

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
}

export async function loginUser(payload: unknown) {
  const data = loginSchema.parse(payload);

  const user = await User.findOne({ email: data.email });

  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(data.password, user.password);

  if (!passwordMatches) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  if (!user.isEmailVerified) {
    throw new AppError(
      403,
      "EMAIL_NOT_VERIFIED",
      "Please verify your email before logging in",
    );
  }

  if (!env.JWT_SECRET_KEY) {
    throw new Error("JWT secret is not configured");
  }

  const token = jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    env.JWT_SECRET_KEY,
    {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  };
}

export async function forgotPassword(payload: unknown) {
  console.log("FORGOT PASSWORD FUNCTION CALLED");

  const data = forgotPasswordSchema.parse(payload);

  console.log(`Forgot password email: ${data.email}`);

  const user = await User.findOne({ email: data.email });

  console.log(`User found: ${!!user}`);

  if (!user) {
    return {
      message:
        "If an account with that email exists, a password reset code has been sent.",
    };
  }

  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

  const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = passwordResetExpires;

  await user.save();

  // Development only: show reset code in backend terminal
  console.log("====================================");
  console.log("🔐 PASSWORD RESET CODE");
  console.log(`Email: ${user.email}`);
  console.log(`Code: ${resetToken}`);
  console.log("Expires: 10 minutes");
  console.log("====================================");

  return {
    message:
      "If an account with that email exists, a password reset code has been sent.",
  };
}

export async function getCurrentUser(payload: JWTPayload | undefined) {
  if (!payload) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  const user = await User.findById(payload.id);

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
}

export async function resetPassword(payload: unknown) {
  const data = resetPasswordSchema.parse(payload);

  const user = await User.findOne({ email: data.email });

  if (!user) {
    throw new AppError(
      400,
      "INVALID_RESET_TOKEN",
      "Invalid or expired password reset code",
    );
  }

  if (!user.passwordResetToken || user.passwordResetToken !== data.token) {
    throw new AppError(
      400,
      "INVALID_RESET_TOKEN",
      "Invalid or expired password reset code",
    );
  }

  if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    throw new AppError(
      400,
      "RESET_TOKEN_EXPIRED",
      "Password reset code has expired",
    );
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 12);

  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  return {
    message: "Password reset successfully",
  };
}

export async function resendVerificationCode(payload: unknown) {
  const data = resendVerificationSchema.parse(payload);

  const user = await User.findOne({ email: data.email });

  if (!user) {
    return {
      message:
        "If an account with that email exists, a verification code has been sent.",
    };
  }

  if (user.isEmailVerified) {
    throw new AppError(
      400,
      "EMAIL_ALREADY_VERIFIED",
      "Email is already verified",
    );
  }

  const verificationCode = generateVerificationCode();

  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

  user.verificationCode = verificationCode;
  user.verificationCodeExpires = verificationCodeExpires;

  await user.save();

  await sendVerificationEmail(user.email, user.fullName, verificationCode);

  // Development only: show new verification code in backend terminal
  console.log("====================================");
  console.log("📧 RESENT VERIFICATION CODE");
  console.log(`Email: ${user.email}`);
  console.log(`Code: ${verificationCode}`);
  console.log("Expires: 10 minutes");
  console.log("====================================");

  return {
    message:
      "If an account with that email exists, a verification code has been sent.",
  };
}
