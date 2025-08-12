import { Router } from "express";
import {
  addOrderLine,
  getLinesByOrderId,
  updateLineStatus,
} from "../controller/rentalOrderLine.controller.js";
import { verifyUser, verifyVendor } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/add").post(verifyVendor, addOrderLine);
router.route("/order/:orderId").get(verifyUser, getLinesByOrderId);
router.route("/:id/status").patch(verifyVendor, updateLineStatus);

export default router;
