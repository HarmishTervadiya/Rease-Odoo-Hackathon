import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Transfer } from "../models/transfer.model.js";
import { RentalOrderLine } from "../models/rentalOrderLine.model.js";
import { Inventory } from "../models/inventory.model.js";
import { createRazorpayPaymentLink } from "../utils/razorpay.js"; // hypothetical helper

export const createTransfer = asyncHandler(async (req, res) => {
  const {
    orderLineId,
    transferType,
    carrier,
    trackingNumber,
    estimatedArrival,
  } = req.body;

  const orderLine = await RentalOrderLine.findById(orderLineId).populate(
    "quotationId"
  );
  if (!orderLine) throw new ApiError(404, "Order line not found");

  const quotation = orderLine.quotationId;

  if (transferType === "pickup") {
    if (orderLine.status !== "pending")
      throw new ApiError(400, "Order not pending for pickup");

    await Inventory.findOneAndUpdate(
      { productId: quotation.productId },
      {
        $inc: {
          availableQuantity: -orderLine.quantity,
          reservedQuantity: orderLine.quantity,
        },
      }
    );

    orderLine.status = "picked";
    await orderLine.save();
  }

  if (transferType === "return") {
    if (!["picked"].includes(orderLine.status))
      throw new ApiError(400, "Order not picked yet");

    await Inventory.findOneAndUpdate(
      { productId: quotation.productId },
      {
        $inc: {
          reservedQuantity: -orderLine.quantity,
          availableQuantity: orderLine.quantity,
        },
      }
    );

    if (orderLine.paymentType === "Full Front") {
      orderLine.status = "returned_paid";
    } else {
      const paymentLink = await createRazorpayPaymentLink(orderLine);
      orderLine.status = "returned_pending_payment";
      orderLine.paymentLink = paymentLink;
    }

    await orderLine.save();
  }

  const transfer = await Transfer.create({
    orderLineId,
    transferType,
    fromUserId: quotation.ownerId,
    toUserId: orderLine.customerId,
    carrier,
    trackingNumber,
    estimatedArrival,
  });

  await Notification.create({
    recipientId: req.body.customerId,
    title: "Pickup Scheduled",
    message: `Your item will be picked up on ${pickupDate} by ${carrier}`,
    type: "pickupScheduled",
    payload: { transferId: transfer._id },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        transfer,
        `${transferType} transfer created successfully`
      )
    );
});
