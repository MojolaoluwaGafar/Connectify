import mongoose, { Schema, Document } from "mongoose";

export interface profile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  age: number;
  location: string;
  occupation: string;
  gender: string;
  about: string;
  interest: string[];
  profilePicture: string | null;
}

const ProfileSchema: Schema = new Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  
  fullName: {
    type: String,
    required: true,
    trim: true,
  },

  age: {
    type: Number,
    required: true,
  },

  location: {
    type: String,
    required: true,
    trim: true,
  },

  occupation: {
    type: String,
    required: false,
    trim: true,
  },

  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "non-binary", "prefer not to say"],
  },

  interest: {
    type: [String],
    required: true,
  },

  about: {
    type: String,
    required: true,
    trim: true,
  },

  profilePicture: {
    type: String,
    default: null,
  },
});


export const Profile = mongoose.model<profile>("Profile", ProfileSchema)