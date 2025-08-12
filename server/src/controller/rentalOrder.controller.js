// controllers/rentalOrder.controller.js
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { RentalOrder } from "../models/rentalOrder.model.js";
import { RentalOrderLine } from "../models/rentalOrderLine.model.js";

const ObjectId = mongoose.Types.ObjectId;

export const createRentalOrder = asyncHandler(async (req, res) => {
  const { customerOrderId, quotationId } = req.body;

  if (!customerOrderId || !quotationId) {
    throw new ApiError(400, "Missing required fields");
  }

  const order = await RentalOrder.create({
    customerOrderId,
    quotationId,
    status: "pending",
    ownerReminderGap: 2,
    customerReminderGap: 2,
  });

  await Notification.create({
    recipientId: req.user._id,
    title: "Order Created",
    message: `Your order ${order._id} has been created.`,
    type: "orderConfirmed",
    payload: { orderId: order._id, status: order.status },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Rental order created successfully"));
});

export const getOrdersForVendor = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;
  const orders = await RentalOrder.find({ vendorId }).sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Vendor orders fetched"));
});

export const getOrdersForCustomer = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const orders = await RentalOrder.find({ customerOrderId: { $exists: true } })
    .populate({ path: "customerOrderId", match: { customerId } })
    .sort({ createdAt: -1 });

  const filtered = orders.filter(
    (o) =>
      o.customerOrderId &&
      o.customerOrderId.customerId &&
      o.customerOrderId.customerId.equals(customerId)
  );
  return res
    .status(200)
    .json(new ApiResponse(200, filtered, "Customer orders fetched"));
});

export const getOrderDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");

  const orderId = ObjectId(id);
  const result = await RentalOrder.aggregate([
    { $match: { _id: orderId } },
    {
      $lookup: {
        from: "rentalorderlines",
        localField: "_id",
        foreignField: "rentalOrderId",
        as: "lines",
      },
    },
    {
      $addFields: {
        totalLines: { $size: "$lines" },
        totalAmountFromLines: { $sum: "$lines.lineTotal" },
      },
    },
  ]);

  if (!result.length) throw new ApiError(404, "Order not found");
  return res
    .status(200)
    .json(new ApiResponse(200, result[0], "Order details fetched"));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;
  const { id } = req.params;
  const { status } = req.body;
  if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");
  if (!status) throw new ApiError(400, "Status required");

  const order = await RentalOrder.findById(id);
  if (!order) throw new ApiError(404, "Order not found");
  if (!order.vendorId.equals(vendorId)) throw new ApiError(403, "Unauthorized");

  order.status = status;
  await order.save();
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated"));
});

export const setTransferDetails = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;
  const { id } = req.params;
  const { transferDetails } = req.body;
  if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");
  if (!transferDetails) throw new ApiError(400, "transferDetails required");

  const order = await RentalOrder.findById(id);
  if (!order) throw new ApiError(404, "Order not found");
  if (!order.vendorId.equals(vendorId)) throw new ApiError(403, "Unauthorized");

  order.transferDetails = transferDetails;
  await order.save();
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Transfer details saved"));
});
