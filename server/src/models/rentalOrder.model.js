import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.Types.ObjectId;

const rentalOrderSchema = new Schema(
  {
    customerOrderId: {
      type: ObjectId,
      ref: "CustomerOrder",
      required: true,
      index: true,
    },
    vendorId: {
      type: ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    totalAmount: { type: Number, default: 0 },
    vendorInvoiceId: {
      type: ObjectId,
      ref: "Invoice",
      sparse: true,
    },
    ownerReminderGapDays: { type: Number, default: 2 },
    customerReminderGapDays: { type: Number, default: 2 },
  },
  { timestamps: true }
);

rentalOrderSchema.index({ customerOrderId: 1, vendorId: 1 });

export const RentalOrder = mongoose.model("RentalOrder", rentalOrderSchema);
