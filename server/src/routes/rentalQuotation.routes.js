// routes/rentalQuotation.routes.js
import { Router } from "express";
import {
  createQuotation,
  getAllQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
  acceptQuotations
} from "../controllers/rentalQuotation.controller.js";
import { verifyUser, verifyVendor } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyUser, getAllQuotations);
router.route("/:id").get(verifyUser, getQuotationById);

router.route("/create").post(verifyVendor, createQuotation);
router.route("/:id").patch(verifyVendor, updateQuotation);
router.route("/:id").delete(verifyVendor, deleteQuotation);

router.route("/accept").post(verifyUser, acceptQuotations);

export default router;
