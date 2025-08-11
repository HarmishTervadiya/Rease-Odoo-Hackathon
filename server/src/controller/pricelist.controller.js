import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PriceList } from "../models/priceList.model.js";

export const addPriceList = asyncHandler(async (req, res) => {
  const { productId, title, validFrom, validTo, price } = req.body;

  if (!productId || !title || !price) {
    throw new ApiError(400, "Product ID, title, and price are required");
  }

  const priceList = await PriceList.create({ productId, title, validFrom, validTo, price });
  return res.status(200).json(new ApiResponse(200, priceList, "Price list added successfully"));
});

export const getPriceListsByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const priceLists = await PriceList.find({ productId }).sort({ validFrom: 1 });
  return res.status(200).json(new ApiResponse(200, priceLists, "Price lists fetched successfully"));
});

export const updatePriceList = asyncHandler(async (req, res) => {
  const { priceListId } = req.params;
  const updateData = req.body;

  const updated = await PriceList.findByIdAndUpdate(priceListId, updateData, { new: true });
  if (!updated) throw new ApiError(404, "Price list not found");

  return res.status(200).json(new ApiResponse(200, updated, "Price list updated successfully"));
});

export const deletePriceList = asyncHandler(async (req, res) => {
  const { priceListId } = req.params;

  const deleted = await PriceList.findByIdAndDelete(priceListId);
  if (!deleted) throw new ApiError(404, "Price list not found");

  return res.status(200).json(new ApiResponse(200, deleted, "Price list deleted successfully"));
});
