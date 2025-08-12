import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Wishlist } from "../models/wishlist.model.js";
import { Product } from "../models/product.model.js";

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if already in wishlist
  const existingWishlistItem = await Wishlist.findOne({
    userId: req.user._id,
    productId: productId,
  });

  if (existingWishlistItem) {
    throw new ApiError(400, "Product already in wishlist");
  }

  const wishlistItem = await Wishlist.create({
    userId: req.user._id,
    productId: productId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, wishlistItem, "Added to wishlist successfully"));
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const wishlistItem = await Wishlist.findOneAndDelete({
    userId: req.user._id,
    productId: productId,
  });

  if (!wishlistItem) {
    throw new ApiError(404, "Product not found in wishlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Removed from wishlist successfully"));
});

const getUserWishlist = asyncHandler(async (req, res) => {
  console.log("Hello");
  const wishlistItems = await Wishlist.find({ userId: req.user._id })
    .populate({
      path: "productId",
      populate: {
        path: "ownerId",
        select: "name email",
      },
    })
    .populate("categoryId", "categoryName")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, wishlistItems, "Wishlist fetched successfully"));
});

const checkWishlistStatus = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const wishlistItem = await Wishlist.findOne({
    userId: req.user._id,
    productId: productId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isInWishlist: !!wishlistItem },
        "Wishlist status checked"
      )
    );
});

export {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  checkWishlistStatus,
};
