// controllers/reservation.controller.js
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Reservation } from "../models/Reservation.js";
import { RentalQuotation } from "../models/RentalQuotation.js";
import { Inventory } from "../models/Inventory.js";

const ObjectId = mongoose.Types.ObjectId;

export const createReservation = asyncHandler(async (req, res) => {
  const { quotationId, productId, qty, from, to } = req.body;
  if (!quotationId || !productId || !qty || !from || !to) throw new ApiError(400, "Missing required fields");
  if (!ObjectId.isValid(quotationId) || !ObjectId.isValid(productId)) throw new ApiError(400, "Invalid id");

  const q = await RentalQuotation.findById(quotationId);
  if (!q) throw new ApiError(404, "Quotation not found");

  const start = new Date(from), end = new Date(to);
  if (start >= end) throw new ApiError(400, "Invalid date range");

  const overlap = await Reservation.aggregate([
    { $match: { productId: ObjectId(productId), status: { $in: ["reserved","active"] }, $or: [{ from: { $lt: end }, to: { $gt: start } }] } },
    { $group: { _id: null, reservedQty: { $sum: "$qty" } } }
  ]);
  const reservedQty = (overlap[0] && overlap[0].reservedQty) || 0;
  const inv = await Inventory.findOne({ productId });
  if (!inv) throw new ApiError(400, "Inventory not found");
  if (inv.totalQuantity - reservedQty < qty) throw new ApiError(400, "Insufficient availability");

  const reservation = await Reservation.create({
    quotationId,
    productId,
    customerId: req.user._id,
    quantity: qty,
    from: start,
    to: end,
    status: "reserved"
  });

  await Inventory.findOneAndUpdate({ productId }, { $inc: { reservedQuantity: qty, availableQuantity: -qty } });

  return res.status(201).json(new ApiResponse(201, reservation, "Reservation created"));
});

export const getReservations = asyncHandler(async (req, res) => {
  const { customerId, vendorId } = req.query;
  const filter = {};
  if (customerId && ObjectId.isValid(customerId)) filter.customerId = customerId;
  if (vendorId && ObjectId.isValid(vendorId)) filter.vendorId = vendorId;

  const reservations = await Reservation.find(filter)
    .populate("quotationId")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, reservations, "Reservations fetched"));
});

export const cancelReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");

  const reservation = await Reservation.findById(id);
  if (!reservation) throw new ApiError(404, "Reservation not found");

  if (!(reservation.customerId && reservation.customerId.equals(req.user._id)) &&
      !(reservation.vendorId && reservation.vendorId.equals(req.user._id))) {
    throw new ApiError(403, "Unauthorized");
  }

  if (reservation.status === "cancelled") {
    throw new ApiError(400, "Already cancelled");
  }

  reservation.status = "cancelled";
  await reservation.save();

  await Inventory.findOneAndUpdate({ productId: reservation.productId }, { $inc: { reservedQuantity: -reservation.qty, availableQuantity: reservation.qty } });
  return res.status(200).json(new ApiResponse(200, reservation, "Reservation cancelled"));
});
