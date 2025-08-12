import mongoose, { Schema } from "mongoose";
import { sendMail, EmailTemplates } from "../utils/mailer.js";

const ObjectId = Schema.Types.ObjectId;

const notificationSchema = new Schema(
  {
    recipientId: {
      type: ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    type: {
      type: String,
      enum: [
        "quotationCreated",
        "quotationAccepted",
        "pickupScheduled",
        "returnScheduled",
        "returnReminder",
        "orderConfirmed",
        "orderCompleted",
        "paymentLink",
        "paymentReceived",
        "payoutReleased"
      ],
      required: true
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    payload: Schema.Types.Mixed,
    dateTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, read: 1, dateTime: -1 });
notificationSchema.post("save", async function (doc) {
  try {
    const populatedDoc = await doc.populate("recipientId", "name email");
    const { email, name } = populatedDoc.recipientId;

    await sendMail({
      recipient: email,
      subject: `Rease Notification - ${doc.title}`,
      template: EmailTemplates.genericNotification,
      templateData: {
        title: doc.title,
        message: doc.message,
        userName: name
      }
    });
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
});

export const Notification = mongoose.model("notifications", notificationSchema);
