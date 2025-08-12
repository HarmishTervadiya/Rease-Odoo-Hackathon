import cron from "node-cron";
import { RentalOrder } from "../models/rentalOrder.model.js";
import { User } from "../models/user.model.js";
import sendMail from "../utils/mailer.js";
import { EmailTemplates } from "../utils/mailer.js";
import { Notification } from "../models/notification.model.js";
import dayjs from "dayjs";

// Daily at 09:00 AM
cron.schedule("0 9 * * *", async () => {
  console.log("🚀 Reminder job started at", new Date());

  try {
    const today = dayjs().startOf("day");

    // 1️⃣ Vendor Pickup Reminders
    const pickupOrders = await RentalOrder.find({
      pickupDateTime: { $exists: true },
      ownerRemainderGap: { $exists: true },
      reminderPickupSent: { $ne: true },
    }).populate("ownerId", "name email");

    for (const order of pickupOrders) {
      const remindDate = dayjs(order.pickupDateTime)
        .subtract(order.ownerRemainderGap, "day")
        .startOf("day");

      if (remindDate.isSame(today)) {
        await Notification.create({
          recipientId: order.ownerId._id,
          title: "Upcoming Pickup",
          message: `Pickup for order ${order._id} is scheduled on ${dayjs(order.pickupDateTime).format("DD MMM YYYY HH:mm")}`,
        });

        await sendMail({
          recipient: order.ownerId.email,
          subject: "Upcoming Pickup Reminder",
          template: `<p>Dear ${order.ownerId.name},</p>
                     <p>This is a reminder that your pickup for order <b>${order._id}</b> is scheduled on <b>${dayjs(order.pickupDateTime).format("DD MMM YYYY HH:mm")}</b>.</p>`,
        });

        order.reminderPickupSent = true;
        await order.save();
      }
    }

    // 2️⃣ Customer Return Reminders
    const returnOrders = await RentalOrder.find({
      returnDateTime: { $exists: true },
      customerRemainderGap: { $exists: true },
      reminderReturnSent: { $ne: true },
    }).populate("customerId", "name email");

    for (const order of returnOrders) {
      const remindDate = dayjs(order.returnDateTime)
        .subtract(order.customerRemainderGap, "day")
        .startOf("day");

      if (remindDate.isSame(today)) {
        await Notification.create({
          recipientId: order.customerId._id,
          title: "Upcoming Return",
          message: `Return for order ${order._id} is scheduled on ${dayjs(order.returnDateTime).format("DD MMM YYYY HH:mm")}`,
        });

        await sendMail({
          recipient: order.customerId.email,
          subject: "Upcoming Return Reminder",
          template: `<p>Dear ${order.customerId.name},</p>
                     <p>This is a reminder that your return for order <b>${order._id}</b> is scheduled on <b>${dayjs(order.returnDateTime).format("DD MMM YYYY HH:mm")}</b>.</p>`,
        });

        order.reminderReturnSent = true;
        await order.save();
      }
    }

    console.log("✅ Reminder job finished successfully");
  } catch (error) {
    console.error("Reminder job failed:", error);
  }
});
