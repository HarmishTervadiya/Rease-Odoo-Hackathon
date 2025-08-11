import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Category } from "../models/category.model.js";

export const addCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.body;

  if (!categoryName) {
    throw new ApiError(400, "Please provide category name");
  }

  const category = await Category.create({ categoryName });

  if (!category) {
    throw new ApiError(500, "Something went wrong while adding category");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category added successfully"));
});

export const getAllCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ categoryName: 1 }); // sorted alphabetically
  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    throw new ApiError(400, "Category ID is required");
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched successfully"));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.body;
  const { categoryName } = req.body;

  if (!categoryId || !categoryName) {
    throw new ApiError(400, "Category ID and name are required");
  }

  const category = await Category.findByIdAndUpdate(
    categoryId,
    { categoryName },
    { new: true }
  );

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category updated successfully"));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.body;

  if (!categoryId) {
    throw new ApiError(400, "Category ID is required");
  }

  const category = await Category.findByIdAndDelete(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Category deleted successfully"));
});
