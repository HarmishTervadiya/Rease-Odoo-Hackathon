import { Router } from "express";
import { createTransfer } from "../controllers/transfer.controller.js";
import { verifyVendor } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyVendor, createTransfer);

export default router;
