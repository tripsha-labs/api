import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'User email required'],
      unique: true,
      index: true,
    },

    username: { type: String, unique: true, index: true },
    awsUesrname: { type: String, unique: true },
    awsUserId: { type: String, unique: true },
    phone: String,
    identity: Object,
    firstName: String,
    lastName: String,
    gender: String,
    bio: String,
    dob: String,
    avatarUrl: String,
    bucketList: String,
    livesIn: String,
    isActive: { type: Boolean, default: true },
    isLookingForTravel: { type: Boolean, default: true },
    spokenLanguages: [String],
    interests: [String],
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isIdentityVerified: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    strict: true,
  }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
