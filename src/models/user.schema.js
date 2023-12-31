/**
 * @name - User schema
 * @description - Mongoose schema for user.
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
    awsUsername: { type: String, index: true },
    awsUserId: { type: Array },
    phone: String,
    identity: Object,
    firstName: String,
    lastName: String,
    gender: String,
    hideFields: { type: Array, default: [] },
    additionalEmails: { type: Array, default: [] },
    bio: String,
    dob: String,
    avatarUrl: String,
    bucketList: String,
    livesIn: String,
    passportCountry: { type: Array, default: [] },
    facebook_url: String,
    twitter_url: String,
    website_url: String,
    discord_url: String,
    instagram_url: String,
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
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
    travelStyle: String,
    travelWithHostReason: String,
    itemsTravelWith: String,
    isTripAgreed: { type: Boolean, default: false },
    isStripeAccountConnected: { type: Boolean, default: false },
    showDashboardTutorial: { type: Boolean, default: true },
    hasFirstBooking: { type: Boolean, default: false },
    isHostFirstLogin: { type: Boolean, default: false },
    isHost: { type: Boolean, default: false },
    hostShare: { type: Number, default: 94 },
    hostRequestSent: { type: Boolean, default: false },
    showUpcomingTrips: { type: Boolean, default: false },
    showPastTrips: { type: Boolean, default: false },
    visaStatus: String,
    dietaryRequirements: String,
    emergencyContact: String,
    mobilityRestrictions: String,
    paymentMethod: { type: String },
    isConcierge: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
