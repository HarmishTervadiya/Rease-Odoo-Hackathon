import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.Types.ObjectId;

const rentalQuotationSchema = new Schema(
  {
    productId: {
      type: ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    productSnapshot: {
      type: Schema.Types.Mixed,
    },
    customerId: {
      type: ObjectId,
      ref: "User",
      index: true,
      sparse: true,
    },
    ownerId: {
      type: ObjectId,
      ref: "User",
      index: true,
    },
    requestedQuantity: {
      type: Number,
      default: 1,
    },
    charges: {
      extraHourPrice: Number,
      extraDayPrice: Number,
      extraWeekPrice: Number,
    },
    pickup: {
      dateTime: Date,
      address: String,
      notes: String,
    },
    return: {
      dateTime: Date,
      address: String,
      notes: String,
    },
    pricingBreakdown: [{ label: String, amount: Number }],
    totalAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "expired", "cancelled"],
      default: "draft",
      index: true,
    },
    expiresAt: { type: Date, index: true },
  },
  { timestamps: true }
);

rentalQuotationSchema.index({ ownerId: 1, customerId: 1, status: 1 });

export const RentalQuotation = mongoose.model(
  "RentalQuotation",
  rentalQuotationSchema
);
