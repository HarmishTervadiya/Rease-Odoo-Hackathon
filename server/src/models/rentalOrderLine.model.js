import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.Types.ObjectId;

const rentalOrderLineSchema = new Schema(
  {
    rentalOrderId: {
      type: ObjectId,
      ref: "RentalOrder",
      required: true,
      index: true,
    },
    quotationId: {
      type: ObjectId,
      ref: "RentalQuotation",
      index: true,
      sparse: true,
    },
    productId: {
      type: ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    productSnapshot: {
      type: Schema.Types.Mixed,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    from: {
      type: Date,
      required: true,
      index: true,
    },
    to: {
      type: Date,
      required: true,
      index: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    extras: [
      {
        label: String,
        amount: Number,
      },
    ],
    lineTotal: {
      type: Number,
      required: true,
    },
    reservationId: {
      type: ObjectId,
      ref: "Reservation",
      sparse: true,
    },
    transferId: {
      type: ObjectId,
      ref: "Transfer",
      sparse: true,
    },
    status: {
      type: String,
      enum: ["reserved", "picked", "in_use", "returned", "cancelled"],
      default: "reserved",
      index: true,
    },
  },
  { timestamps: true }
);

rentalOrderLineSchema.index({ rentalOrderId: 1, productId: 1 });

export const RentalOrderLine = mongoose.model(
  "RentalOrderLine",
  rentalOrderLineSchema
);
