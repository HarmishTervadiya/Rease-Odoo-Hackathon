import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.Types.ObjectId;

const transferSchema = new Schema(
  {
    type: { type: String, enum: ["pickup", "delivery"], required: true },
    rentalOrderId: {
      type: ObjectId,
      ref: "RentalOrder",
      index: true,
      sparse: true,
    },
    rentalOrderLineId: {
      type: ObjectId,
      ref: "RentalOrderLine",
      index: true,
      sparse: true,
    },
    scheduledAt: {
      type: Date,
      index: true,
    },
    address: { type: String },
    assignedTo: {
      type: ObjectId,
      ref: "User",
      index: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["planned", "in_transit", "delivered", "returned", "cancelled"],
      default: "planned",
      index: true,
    },
    tracking: [{ ts: Date, status: String, notes: String }],
  },
  { timestamps: true }
);

transferSchema.index({ rentalOrderId: 1, scheduledAt: 1 });
transferSchema.index({ rentalOrderLineId: 1, scheduledAt: 1 });

export const Transfer = mongoose.model("Transfer", transferSchema);
