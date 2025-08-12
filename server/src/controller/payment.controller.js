import { asyncHandler } from "../utils/asyncHandler";

export const paymentCompleted = asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body;

  await Notification.create({
    recipientId: vendorId,
    title: "Payment Received",
    message: `You have received ₹${amount} for order ${orderId}.`,
    type: "paymentReceived",
    payload: { orderId, amount },
  });

  res.status(200).json(new ApiResponse(200, null, "Payment recorded"));
});
