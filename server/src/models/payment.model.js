import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.Types.ObjectId;

const paymentSchema = new Schema(
  {
    invoiceId: {
      type: ObjectId,
      ref: "Invoice",
      index: true,
    },
    customerId: {
      type: ObjectId,
      ref: "User",
      index: true,
      sparse: true,
    },
    customerOrderId: {
      type: ObjectId,
      ref: "CustomerOrder",
      index: true,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dateTime: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentType: {
      type: String,
      enum: ["full_upfront", "partial_deposit", "late_fee", "refund"],
      default: "full_upfront",
    },
    gatewayRef: String,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

paymentSchema.index({ invoiceId: 1, customerOrderId: 1 });

export const Payment = mongoose.model("Payment", paymentSchema);
