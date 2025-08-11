import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.Types.ObjectId;

const vendorPayoutSchema = new Schema(
  {
    vendorId: {
      type: ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    rentalOrderId: {
      type: ObjectId,
      ref: "rentalOrders",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    scheduledAt: Date,
    paidAt: Date,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

vendorPayoutSchema.index({ vendorId: 1, status: 1, scheduledAt: 1 });

export const VendorPayout = mongoose.model("vendorPayouts", vendorPayoutSchema);
