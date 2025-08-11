import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const userRegister = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.clerkToken ||
    req
      .header("Authorization")
      ?.replace(/^Bearer\s+/i, "")
      .trim();

  const userCheck = await User.findOne({ clerkId: token }).select("-clerkId");

  if (userCheck) {
    userCheck.clerkId = "";
    return res
      .status(200)
      .json(
        new ApiResponse(200, userCheck, "User account created successfully")
      );
  }

  const { name, email, mobileNo, role, profilePicUri } = req.body;

  if (
    [name, email, mobileNo, role, profilePicUri].some(
      (e) => e == null || e == ""
    )
  ) {
    throw new ApiError(400, "Please pass all of the parameters");
  }

  if (!token) {
    throw new ApiError(400, "Bad request: Token not found");
  }

  const user = await User.create({
    name,
    clerkId: token,
    email,
    role,
    mobileNo,
    avatar: { uri: profilePicUri, publicId: "" },
  });

  if (!user) {
    throw new ApiError(
      500,
      "Something went wrong while creating the user account."
    );
  }

  user.clerkId = "";
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User account created successfully"));
});

export { userRegister };
