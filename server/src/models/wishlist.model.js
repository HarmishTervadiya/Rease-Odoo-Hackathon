import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.Types.ObjectId;

const wishlistSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can only add a product once to their wishlist
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
