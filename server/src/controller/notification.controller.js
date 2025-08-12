import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendMail, EmailTemplates } from "../utils/mailer.js";
import { User } from "../models/user.model.js";

export const sendNotification = asyncHandler(async (req, res) => {
  const { recipientId, type, payload, title, message } = req.body;

  if (!recipientId || !type) {
    throw new ApiError(400, "Recipient ID and notification type are required");
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new ApiError(404, "Recipient not found");
  }

  const notification = await Notification.create({
    recipientId,
    title: title || type,
    message: message || "",
    type,
    payload,
    dateTime: new Date(),
  });

  return res.status(201).json(
    new ApiResponse(201, notification, "Notification sent successfully")
  );
});

export const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const notifications = await Notification.find({ recipientId: userId })
    .sort({ dateTime: -1 })
    .lean();
  return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched"));
});
