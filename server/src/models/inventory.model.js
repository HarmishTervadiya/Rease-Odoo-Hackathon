import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.Types.ObjectId;

const inventorySchema = new Schema(
  {
    productId: {
      type: ObjectId,
      ref: "Product",
      required: true,
      unique: true,
      index: true,
    },
    totalQuantity: {
      type: Number,
      default: 0,
    },
    availableQuantity: {
      type: Number,
      default: 0,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Inventory = mongoose.model("Inventory", inventorySchema);
