import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.Types.ObjectId;

const reservationSchema = new Schema(
  {
    productId: {
      type: ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    customerOrderId: {
      type: ObjectId,
      ref: "CustomerOrder",
      index: true,
      sparse: true,
    },
    rentalOrderId: {
      type: ObjectId,
      ref: "RentalOrder",
      index: true,
      sparse: true,
    },
    quotationId: {
      type: ObjectId,
      ref: "RentalQuotation",
      index: true,
      sparse: true,
    },
    quantity: {
      type: Number,
      required: true,
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
    status: {
      type: String,
      enum: ["reserved", "active", "returned", "cancelled"],
      default: "reserved",
      index: true,
    },
  },
  { timestamps: true }
);

reservationSchema.index({ productId: 1, from: 1, to: 1, status: 1 });

export const Reservation = mongoose.model("Reservation", reservationSchema);
