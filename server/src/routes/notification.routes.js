import { Router } from "express";
import { sendNotification, getUserNotifications } from "../controller/notification.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/send").post(sendNotification);
router.route("/my").get(verifyUser, getUserNotifications);

export default router;
