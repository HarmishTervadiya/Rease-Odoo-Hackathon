import { Router } from "express";
import {
  createRentalOrder,
  getOrdersForVendor,
  getOrdersForCustomer,
  getOrderDetails,
  updateOrderStatus,
  setTransferDetails,
} from "../controllers/rentalOrder.controller.js";
import { verifyUser, verifyVendor } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyVendor, createRentalOrder);
router.route("/vendor").get(verifyVendor, getOrdersForVendor);
router.route("/customer").get(verifyUser, getOrdersForCustomer);
router.route("/:id").get(verifyUser, getOrderDetails);
router.route("/:id/status").patch(verifyVendor, updateOrderStatus);
router.route("/:id/transfer").patch(verifyVendor, setTransferDetails);

export default router;
