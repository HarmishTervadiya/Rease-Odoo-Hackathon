import crypto from "crypto";
import { CustomerTransaction } from "../models/customerTransaction.model.js";

const router = express.Router();

router.post("/razorpay-webhook", express.json({ type: "*/*" }), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto.createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  const event = req.body.event;

  if (event === "payment_link.paid") {
    const paymentLinkId = req.body.payload.payment_link.entity.id;

    await CustomerTransaction.findOneAndUpdate(
      { paymentLinkId },
      { status: "completed" }
    );
  }

  res.json({ status: "ok" });
});