/**
 * @name - User schema
 * @description - This is mongoose schema for user
 */
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    username: { type: String, index: true },
    awsUsername: { type: String },
    awsUserId: { type: String },
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
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isLookingForTravel: { type: Boolean, default: true },
    spokenLanguages: [String],
    interests: [String],
    isOnline: { type: Boolean, default: false },
    lastOnlineTime: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isIdentityVerified: { type: Boolean, default: false },
    stripeCustomerId: String,
    stripeAccountId: String,
    showDashboardTutorial: Boolean,
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
