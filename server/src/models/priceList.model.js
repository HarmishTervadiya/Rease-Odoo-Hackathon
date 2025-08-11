import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.Types.ObjectId;

const priceListSchema = new Schema(
  {
    productId: {
      type: ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    title: {
      type: String,
    },
    validFrom: {
      type: Date,
      index: true,
    },
    validTo: {
      type: Date,
      index: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    pricing: {
      unit: {
        type: String,
        enum: ["hour", "day", "week", "month"],
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
    additionalRules: [{ minDuration: Number, discountPct: Number }],
  },
  { timestamps: true }
);

priceListSchema.index({ productId: 1, "pricing.unit": 1 });

export const PriceList = mongoose.model("PriceList", priceListSchema);
