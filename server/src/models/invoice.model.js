import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.Types.ObjectId;

const invoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, index: true, sparse: true },
    type: {
      type: String,
      enum: ["customer", "vendor", "adjustment"],
      required: true,
      index: true,
    },
    linkedOrderId: { type: ObjectId, index: true }, // can point to CustomerOrder or RentalOrder
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "issued", "paid", "cancelled"],
      default: "draft",
      index: true,
    },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

invoiceSchema.index({ linkedOrderId: 1, type: 1 });

export const Invoice = mongoose.model("Invoice", invoiceSchema);
