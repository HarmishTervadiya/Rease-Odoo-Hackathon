// controllers/rentalOrderLine.controller.js
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { RentalOrderLine } from "../models/RentalOrderLine.js";
import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId;

export const addOrderLine = asyncHandler(async (req, res) => {
  const { rentalOrderId, productId, qty, from, to, unitPrice, lineTotal } = req.body;
  if (!rentalOrderId || !productId || !qty || !from || !to) throw new ApiError(400, "Missing required fields");
  if (!ObjectId.isValid(rentalOrderId) || !ObjectId.isValid(productId)) throw new ApiError(400, "Invalid id");

  const line = await RentalOrderLine.create({
    rentalOrderId, productId,
    qty, from: new Date(from), to: new Date(to),
    unitPrice: unitPrice || 0,
    lineTotal: lineTotal || (unitPrice || 0) * qty
  });

  return res.status(201).json(new ApiResponse(201, line, "Order line added"));
});

export const getLinesByOrderId = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  if (!ObjectId.isValid(orderId)) throw new ApiError(400, "Invalid orderId");

  const lines = await RentalOrderLine.find({ rentalOrderId: orderId })
    .populate("productId", "productName images")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, lines, "Lines fetched"));
});

export const updateLineStatus = asyncHandler(async (req, res) => {
  const { id } = req.params; 
  const { status } = req.body;
  if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");
  if (!status) throw new ApiError(400, "Status required");

  const line = await RentalOrderLine.findById(id);
  if (!line) throw new ApiError(404, "Order line not found");

  line.status = status;
  await line.save();
  return res.status(200).json(new ApiResponse(200, line, "Order line updated"));
});


export const returnRentalOrderLine = asyncHandler(async (req, res) => {
    const { orderLineId } = req.params;
    const actualReturnDate = new Date();
  
    const orderLine = await RentalOrderLine.findById(orderLineId)
      .populate("quotationId");
  
    if (!orderLine) throw new ApiError(404, "Order line not found");
    if (orderLine.status === "returned") {
      throw new ApiError(400, "This product has already been returned");
    }
  
    const quotation = orderLine.quotationId;
  
    const order = await RentalOrder.findById(orderLine.rentalOrderId)
      .populate("customerOrderId");
  
    const customerOrder = order.customerOrderId;
  
    let remainingAmount = 0;
    let lateFee = 0;
  
    if (customerOrder.paymentType === "Full Front") {
      remainingAmount = 0;
    }
    else if (customerOrder.paymentType === "Partial payment / deposit") {
      remainingAmount = quotation.totalPrice - customerOrder.paidAmount;
      if (remainingAmount < 0) remainingAmount = 0;
    }
  
    const plannedReturn = new Date(quotation.returnDateTime);
    if (actualReturnDate > plannedReturn) {
      const lateHours = Math.ceil((actualReturnDate - plannedReturn) / (1000 * 60 * 60));
      const lateDays = Math.floor(lateHours / 24);
  
      if (lateDays >= 1) {
        lateFee = lateDays * quotation.charges.extraDayPrice;
      } else {
        lateFee = lateHours * quotation.charges.extraHourPrice;
      }
    }
  
    remainingAmount += lateFee;
  
    if (remainingAmount > 0) {
      const paymentResult = await processPayment({
        customerId: customerOrder.customerId,
        amount: remainingAmount,
        description: lateFee > 0 ? "Late return charges" : "Rental balance"
      });
  
      if (!paymentResult.success) {
        throw new ApiError(500, "Payment processing failed");
      }
    }
  
    orderLine.status = "returned";
    await orderLine.save();
  
    await Inventory.findOneAndUpdate(
      { productId: quotation.productId },
      { $inc: { availableQuantity: orderLine.quantity } }
    );
  
    return res.status(200).json(
      new ApiResponse(200, { orderLine, remainingAmount, lateFee }, "Product return processed successfully")
    );
  });