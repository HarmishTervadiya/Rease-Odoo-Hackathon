import { Router } from "express";
import { createReservation, getReservations, cancelReservation } from "../controllers/reservation.controller.js";
import { verifyUser, verifyVendor } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyUser, getReservations);
router.route("/create").post(verifyUser, createReservation);
router.route("/:id/cancel").patch(verifyUser, cancelReservation);

export default router;
