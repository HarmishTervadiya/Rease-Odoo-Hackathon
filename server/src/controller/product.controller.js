import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { Inventory } from "../models/inventory.model.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const addProduct = asyncHandler(async (req, res) => {
  const { productName, productInfo, categoryId, baseQuantity } = req.body;

  if ([productName, productInfo, categoryId, baseQuantity].some((e) => !e)) {
    throw new ApiError(400, "Please provide all the necessary fields");
  }

  let uploadedImages = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploadResult = await uploadToCloudinary(file.path, "image");
      if (uploadResult) {
        uploadedImages.push({
          uri: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        });
      }
    }
  }

  const product = await Product.create({
    ownerId: req.user._id,
    productName,
    productInfo,
    categoryId,
    images: uploadedImages,
    baseQuantity,
  });

  await Inventory.create({
    productId: product._id,
    totalQuantity: baseQuantity,
    availableQuantity: baseQuantity,
    reservedQuantity: 0,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, product, "Product & inventory added successfully")
    );
});

const updateProductDetails = asyncHandler(async (req, res) => {
  const { productId, productName, productInfo, categoryId, status } = req.body;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, ownerId: req.user._id },
    { productName, productInfo, categoryId, status },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, "Product not found or unauthorized");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, product, "Product details updated successfully")
    );
});

const increaseProductQuantity = asyncHandler(async (req, res) => {
  const { productId, amount } = req.body;
  if (!productId || !amount) {
    throw new ApiError(400, "Product ID and amount are required");
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, ownerId: req.user._id },
    { $inc: { baseQuantity: amount } },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, "Product not found or unauthorized");
  }
  await Inventory.findOneAndUpdate(
    { productId },
    { $inc: { totalQuantity: amount, availableQuantity: amount } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product quantity increased"));
});

const decreaseProductQuantity = asyncHandler(async (req, res) => {
  const { productId, amount } = req.body;
  if (!productId || !amount) {
    throw new ApiError(400, "Product ID and amount are required");
  }

  const product = await Product.findOne({
    _id: productId,
    ownerId: req.user._id,
  });
  if (!product) {
    throw new ApiError(404, "Product not found or unauthorized");
  }

  if (product.baseQuantity - amount < 0) {
    throw new ApiError(400, "Quantity cannot be negative");
  }

  product.baseQuantity -= amount;
  await product.save();

  await Inventory.findOneAndUpdate(
    { productId },
    { $inc: { totalQuantity: -amount, availableQuantity: -amount } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product quantity decreased"));
});

const changeProductCategory = asyncHandler(async (req, res) => {
  const { productId, categoryId } = req.body;
  if (!productId || !categoryId) {
    throw new ApiError(400, "Product ID and category ID are required");
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, ownerId: req.user._id },
    { categoryId },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, "Product not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product category updated"));
});

const updateProductImages = asyncHandler(async (req, res) => {
  const { productId, updatedImagesList } = req.body;
  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const product = await Product.findOne({
    _id: productId,
    ownerId: req.user._id,
  });
  if (!product) {
    throw new ApiError(404, "Product not found or unauthorized");
  }

  const imagesToDelete = product.images.filter(
    (img) => !updatedImagesList.includes(img.publicId)
  );
  for (const img of imagesToDelete) {
    await deleteFromCloudinary(img.publicId, "image");
  }

  product.images = product.images.filter((img) =>
    updatedImagesList.includes(img.publicId)
  );

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploadResult = await uploadToCloudinary(file.path, "image");
      if (uploadResult) {
        product.images.push({
          uri: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        });
      }
    }
  }

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product images updated successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const { search, categoryId, status } = req.query;
  const filter = {};

  if (search) {
    filter.$text = { $search: search };
  }
  if (categoryId) {
    filter.categoryId = categoryId;
  }
  if (status) {
    filter.status = status;
  }

  const products = await Product.find(filter)
    .populate("ownerId", "name email")
    .populate("categoryId", "categoryName")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const product = await Product.findById(productId)
    .populate("ownerId", "name email")
    .populate("categoryId", "categoryName");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    throw new ApiError(400, "Category ID is required");
  }

  const products = await Product.find({ categoryId })
    .populate("ownerId", "name email")
    .populate("categoryId", "categoryName")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        products,
        "Products by category fetched successfully"
      )
    );
});

const getProductsByVendor = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;

  if (!ownerId) {
    throw new ApiError(400, "Owner ID is required");
  }

  const products = await Product.find({ ownerId })
    .populate("ownerId", "name email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        products,
        "Products by category fetched successfully"
      )
    );
});

export {
  addProduct,
  updateProductDetails,
  increaseProductQuantity,
  decreaseProductQuantity,
  changeProductCategory,
  updateProductImages,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsByVendor
};
