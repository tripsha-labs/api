import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },

    username: { type: String, unique: true, index: true },
    awsUesrname: { type: String, unique: true },
    awsUserId: { type: String, unique: true },

    firstName: String,
    lastName: String,
    gender: String,
    bio: String,
    dob: String,
    avatarUrl: String,
    avatarUrl: String,
    bucketList: String,
    livesIn: String,
    isActive: Boolean,
    isLookingForTravel: Boolean,
    spokenLanguages: [String],
    spokenLanguages: [String],
    interests: [String],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    strict: true,
  }
);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
