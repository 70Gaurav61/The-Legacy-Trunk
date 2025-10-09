import cron from "node-cron";
import ScheduledMessage from "../../models/ScheduledMessage.js";
import Notification from "../../models/Notification.js";

export const startScheduledDeliveryJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();
      const dueMessages = await ScheduledMessage.find({
        delivered: false,
        deliverAt: { $lte: now },
      }).populate("author family");

      for (const msg of dueMessages) {
        // Create a family-wide notification
        await Notification.create({
          user: msg.author._id,
          type: "scheduled_message_delivery",
          payload: {
            familyId: msg.family._id,
            message: msg.content,
            attachments: msg.attachments,
          },
        });

        msg.delivered = true;
        await msg.save();
      }

      if (dueMessages.length > 0)
        console.log(`✅ Delivered ${dueMessages.length} scheduled messages`);
    } catch (err) {
      console.error("Scheduled message delivery failed:", err);
    }
  });
};
