import mongoose, { Schema, Document } from 'mongoose';

export interface profile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  age: number;
  location: string;
  occupation: string;
  gender: string;
  about: string;
  interests: string[];
  profilePicture: string | null;
  // Full gallery, main photo first — photos[0] is kept in sync with
  // profilePicture so every existing single-photo consumer keeps working.
  photos: string[];
  locationCoords?: {
    type: 'Point';
    coordinates: [number, number];
  };
  isComplete:boolean
}

const LocationCoordsSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (value: number[]) =>
          value.length === 2 &&
          Math.abs(value[0] as number) <= 180 &&
          Math.abs(value[1] as number) <= 90,
        message: 'Location coordinates must be [longitude, latitude]',
      },
    },
  },
  { _id: false },
);

const ProfileSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

  // GeoJSON point ([longitude, latitude]) for the near-me tab. Hidden from
  // queries by default so other users' coordinates can't leak through the many
  // places that spread whole profile documents into API responses — opt in
  // with .select('+locationCoords') where it's genuinely needed.
  locationCoords: {
    type: LocationCoordsSchema,
    select: false,
  },

  occupation: {
    type: String,
    required: false,
    trim: true,
  },

  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'],
  },

  interests: {
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

  photos: {
    type: [String],
    default: [],
  },
  isComplete:{
    type: Boolean,
    default: false

  }
});

ProfileSchema.index({ locationCoords: '2dsphere' });

export const Profile = mongoose.model<profile>('Profile', ProfileSchema);
