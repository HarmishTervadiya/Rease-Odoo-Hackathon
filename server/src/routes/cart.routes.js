import { Router } from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
} from "../controller/cart.controller.js";
import { verifyCustomer } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply auth middleware to all routes
router.use(verifyCustomer);

// Add item to cart
router.post("/add", addToCart);

// Get user's cart
router.get("/", getCart);

// Remove item from cart
router.delete("/remove/:orderLineId", removeFromCart);

export default router;
