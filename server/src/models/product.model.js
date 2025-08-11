import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.Types.ObjectId;

const productSchema = new Schema(
  {
    ownerId: { type: ObjectId, ref: "User", required: true, index: true },
    productName: { type: String, required: true, trim: true },
    productInfo: { type: String },
    categoryId: { type: ObjectId, ref: "Category", index: true },
    images: [{ uri: String, publicId: String }],
    status: {
      type: String,
      enum: ["available", "unavailable", "disabled"],
      default: "available",
      index: true,
    },
    baseQuantity: { type: Number, default: 1 },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

productSchema.index({ productName: "text", productInfo: "text" });

export const Product = mongoose.model("Product", productSchema);
