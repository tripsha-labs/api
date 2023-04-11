/**
 * @name - Billing schema
 * @description - This is the mongoose billing schema.
 */
import mongoose, { Schema } from 'mongoose';

const invoiceItemSchema = new mongoose.Schema(
  {
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', index: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', index: true },
    tripOwnerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    travelerCount: { type: Number, default: 0 },
    guestCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const InvoiceItem =
  mongoose.models.InvoiceItem ||
  mongoose.model('InvoiceItem', invoiceItemSchema);

const invoiceSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    invoiceNumber: { type: String, index: true },
    paymentMethodId: { type: String },
    customerId: { type: String }, // stripe customer id
    paymentDate: { type: Number },
    paymentError: { type: Object },
    paymentRetryCount: { type: Number, default: 0 },
    totalUnits: { type: Number },
    guests: { type: Number },
    travelers: { type: Number },
    unitCost: { type: Number },
    currency: { type: String, default: 'USD' },
    amount: { type: Number, default: 0 },
    status: { type: String, index: true, default: 'draft' },
    isArchived: { type: Boolean, default: false },
    paymentIntentId: { type: String },
    isWaivedOff: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Invoice =
  mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
