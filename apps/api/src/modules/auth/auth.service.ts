import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  changePasswordSchema,
} from '@connecti/shared'
import { AppError } from '../../core/errors/app-error.js'
import { User } from '../../model/User.js'
import { Profile } from '../../model/profile.js'
import { Like } from '../../model/likes.js'
import { Message } from '../../model/messages.js'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import type { JWTPayload } from '../../types/payload.js'
import { ActivationTemplate } from '../../MailTemplates/Activate.js'
import { SendEmail } from '../../utils/SendMail.js'
import { ForgetPassWordTemplate } from '../../MailTemplates/forgetPassword.js'
import {
  generateOneTimeCode,
  hashOneTimeCode,
  verifyOneTimeCode,
} from '../../core/auth/one-time-code.js'

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

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
async function sendForgetPasswordVerificationEmail(
  email: string,
  fullName: string,
  verificationCode: string,
) {
  const firstName = fullName.trim().split(/\s+/)[0] || "there";

  await SendEmail({
    to: email,
    subject: "Password Reset Code",
    html: ForgetPassWordTemplate(firstName, verificationCode),
  });
}

export async function registerUser(payload: unknown) {
  const data = registerSchema.parse(payload);

  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new AppError(409, "EMAIL_ALREADY_EXISTS", "Email already in use");
  } 

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const verificationCode = generateOneTimeCode();

  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

  // Development only: show verification code in backend terminal
  // console.log("====================================");
  // console.log("📧 VERIFICATION CODE");
  // console.log(`Email: ${data.email}`);
  // console.log(`Code: ${verificationCode}`);
  // console.log("Expires: 10 minutes");
  // console.log("====================================");

  const newUser = await User.create({
    fullName: data.fullName,
    email: data.email,
    password: hashedPassword,
    role: "user",
    isEmailVerified: false,
    // Only the HMAC is stored; the plain code goes to the user's inbox.
    verificationCode: hashOneTimeCode(
      'email-verification',
      data.email,
      verificationCode,
    ),
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

  if (
    !verifyOneTimeCode(
      'email-verification',
      user.email,
      data.code,
      user.verificationCode,
    )
  ) {
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

  // Check if the user exists first
  if (!user) {
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password',
    )
  }

  // Google-only users don't have a password
  if (!user.password) {
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password',
    )
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
  // console.log("FORGOT PASSWORD FUNCTION CALLED");

  const data = forgotPasswordSchema.parse(payload);

  // console.log(`Forgot password email: ${data.email}`);

  const user = await User.findOne({ email: data.email });

  // console.log(`User found: ${!!user}`);

  if (!user) {
    return {
      message:
        "If an account with that email exists, a password reset code has been sent.",
    };
  }

  const resetToken = generateOneTimeCode();

  const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  user.passwordResetToken = hashOneTimeCode(
    'password-reset',
    user.email,
    resetToken,
  );
  user.passwordResetExpires = passwordResetExpires;

  await user.save();

  // Development only: show reset code in backend terminal
  // console.log("====================================");
  // console.log("🔐 PASSWORD RESET CODE");
  // console.log(`Email: ${user.email}`);
  // console.log(`Code: ${resetToken}`);
  // console.log("Expires: 10 minutes");
  // console.log("====================================");

    await sendForgetPasswordVerificationEmail(
    user.email,
    user.fullName,
    resetToken,
  );
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

  if (
    !verifyOneTimeCode(
      'password-reset',
      user.email,
      data.token,
      user.passwordResetToken,
    )
  ) {
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

export async function changePassword(
  currentUser: JWTPayload | undefined,
  payload: unknown,
) {
  if (!currentUser) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  const data = changePasswordSchema.parse(payload);

  const user = await User.findById(currentUser.id);

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  if (!user.password) {
    throw new AppError(
      400,
      "NO_PASSWORD_SET",
      "This account signs in with Google and has no password to change",
    );
  }

  const passwordMatches = await bcrypt.compare(
    data.currentPassword,
    user.password,
  );

  if (!passwordMatches) {
    // 400, not 401 — a 401 here would trip the axios interceptor's
    // global "session expired" redirect-to-login on a simple typo.
    throw new AppError(
      400,
      "INVALID_CURRENT_PASSWORD",
      "Current password is incorrect",
    );
  }

  user.password = await bcrypt.hash(data.newPassword, 12);

  await user.save();

  return {
    message: "Password changed successfully",
  };
}

export async function deleteAccount(currentUser: JWTPayload | undefined) {
  if (!currentUser) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  const user = await User.findById(currentUser.id);

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  const userId = user._id;

  await Promise.all([
    Profile.deleteOne({ userId }),
    Like.deleteMany({ $or: [{ likerId: userId }, { likedUserId: userId }] }),
    Message.deleteMany({
      matchId: { $regex: `(^|_)${String(userId)}(_|$)` },
    }),
  ]);

  await user.deleteOne();

  return {
    message: "Account deleted successfully",
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

  const verificationCode = generateOneTimeCode();

  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

  user.verificationCode = hashOneTimeCode(
    'email-verification',
    user.email,
    verificationCode,
  );
  user.verificationCodeExpires = verificationCodeExpires;

  await user.save();

  await sendVerificationEmail(user.email, user.fullName, verificationCode);

  // Development only: show new verification code in backend terminal
  // console.log("====================================");
  // console.log("📧 RESENT VERIFICATION CODE");
  // console.log(`Email: ${user.email}`);
  // console.log(`Code: ${verificationCode}`);
  // console.log("Expires: 10 minutes");
  // console.log("====================================");

  return {
    message:
      "If an account with that email exists, a verification code has been sent.",
  };
}

export async function googleLogin(payload: unknown) {
  const { idToken } = payload as { idToken?: string }

  if (!idToken) {
    throw new AppError(
      400,
      'GOOGLE_TOKEN_REQUIRED',
      'Google ID token is required',
    )
  }

  if (!env.GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID is not configured')
  }

  let ticket

  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    })
  } catch {
    throw new AppError(
      401,
      'INVALID_GOOGLE_TOKEN',
      'Invalid Google authentication token',
    )
  }

  const googlePayload = ticket.getPayload()

  if (!googlePayload) {
    throw new AppError(
      401,
      'INVALID_GOOGLE_TOKEN',
      'Unable to read Google authentication data',
    )
  }

  const {
    sub: googleId,
    email,
    name,
    email_verified,
  } = googlePayload

  if (!googleId || !email || !name) {
    throw new AppError(
      400,
      'INVALID_GOOGLE_ACCOUNT',
      'Google account information is incomplete',
    )
  }

  if (!email_verified) {
    throw new AppError(
      403,
      'GOOGLE_EMAIL_NOT_VERIFIED',
      'Google email is not verified',
    )
  }

  // 1. Check if this Google account already exists
  let user = await User.findOne({ googleId })

  // 2. If not found, check whether the email already exists
  if (!user) {
    user = await User.findOne({ email: email.toLowerCase() })

    // Existing normal account
    if (user) {
      user.googleId = googleId
      user.isEmailVerified = true

      await user.save()
    }

    // Completely new Google account
    if (!user) {
      user = await User.create({
        fullName: name,
        email: email.toLowerCase(),
        googleId,
        role: 'user',
        isEmailVerified: true,
      })
    }
  }

  if (!env.JWT_SECRET_KEY) {
    throw new Error('JWT secret is not configured')
  }

  // Create Connectify's own JWT
  const token = jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    env.JWT_SECRET_KEY,
    {
      expiresIn:
        env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    },
  )

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  }
}