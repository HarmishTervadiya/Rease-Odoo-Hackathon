import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyUser = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.clerkToken ||
    req
      .header("Authorization")
      ?.replace(/^Bearer\s+/i, "")
      .trim();

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  const user = await User.findOne({ clerkId: token }).select("-clerkId");
  console.log("Submitting product:", user);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  req.user = user;
  next();
});

export const verifyCustomer = [
  verifyUser,
  (req, res, next) => {
    if (req.user.role !== "customer") {
      throw new ApiError(403, "Forbidden: Customers only");
    }
    next();
    console.log("Verified");
  },
];

export const verifyVendor = [
  verifyUser,
  (req, res, next) => {
    if (req.user.role !== "vendor") {
      throw new ApiError(403, "Forbidden: Vendors only");
    }

    next();
  },
];
