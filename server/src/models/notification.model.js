import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.Types.ObjectId;

const notificationSchema = new Schema(
  {
    recipientId: {
      type: ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    title: {
      type: String,
    },
    message: {
      type: String,
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

export const Notification = mongoose.model("notifications", notificationSchema);
