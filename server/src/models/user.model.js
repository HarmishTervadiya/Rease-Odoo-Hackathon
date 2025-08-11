import { timeStamp } from "console";
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    clerkId: {
      type: String,
      index: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
    },
    mobileNo: {
      type: String,
      index: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["customer", "vendor"],
      default: "customer",
    },
    avatar: {
      uri: String,
      publicId: String,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

export const User = mongoose.model("User", userSchema);
