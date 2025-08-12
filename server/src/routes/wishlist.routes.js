import { Router } from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  checkWishlistStatus,
} from "../controller/wishlist.controller.js";
import { verifyCustomer } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply auth middleware to all routes
// router.use(verifyCustomer);

// Add product to wishlist
router.post("/add", verifyCustomer, addToWishlist);

// Remove product from wishlist
router.delete("/remove/:productId", removeFromWishlist);

// Get user's wishlist
router.get("/user", getUserWishlist);

// Check if product is in user's wishlist
router.get("/check/:productId", checkWishlistStatus);

export default router;
