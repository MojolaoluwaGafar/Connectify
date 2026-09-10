import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";


export interface User extends Document {
  fullName: string;
  email: string;
  password?: string;
  role: string;
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  googleId?: string;
}

const UserSchema: Schema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Invalid Email"],
  },
  password: {
    type: String,
    required: false,
    minLength: 8,
  },
  role: {
    type: String,
    required: true,
    enum: ["user", "admin"],
    default: "user",
    lowercase: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },

  verificationCode: {
    type: String,
  },

  verificationCodeExpires: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },

  passwordResetExpires: {
    type: Date,
  },
  googleId: {
    type: String,
    required: false
  }
});

export const User = mongoose.model<User>("User", UserSchema);
