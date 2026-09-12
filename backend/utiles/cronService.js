
import cron from "node-cron";
import Memory from "../models/Memory.js";
import Person from "../models/Person.js";
import User from "../models/User.js";
import { createNotification } from "./notificationService.js";

// Helper to check if Month & Day match
const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;

  // Use UTC to ensure consistent day comparison across timezones
  return date1.getUTCDate() === date2.getUTCDate() &&
    date1.getUTCMonth() === date2.getUTCMonth();
};

export const startCronJobs = () => {
  console.log("Cron Jobs initialized...");

  // SET to "0 9 * * *" (9:00 AM)
  cron.schedule("0 9 * * *", async () => {
    console.log("📅 Running Daily Checks...");
    const today = new Date();

    try {
      const allMemories = await Memory.find();
      for (const memory of allMemories) {
        if (memory.date && isSameDay(new Date(memory.date), today)) {
          const yearsAgo = today.getFullYear() - new Date(memory.date).getFullYear();
          if (yearsAgo > 0) {
            await createNotification({
              recipient: memory.author,
              sender: memory.author,
              type: 'on_this_day',
              payload: {
                memoryId: memory._id,
                message: `You have a memory from ${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago today!`,
                yearsAgo: yearsAgo
              }
            });
            console.log(`✨ Sent On This Day alert to ${memory.author}`);
          }
        }
      }

      // 2. BIRTHDAY CHECK (Using 'dob')
      const allPeople = await Person.find().populate("family");

      for (const person of allPeople) {

        if (person.dob && isSameDay(new Date(person.dob), today)) {

          console.log(`🎂 Found Birthday: ${person.name}`);

          if (person.family) {
            const familyMembers = await User.find({ families: person.family });

            for (const member of familyMembers) {
              const isBirthdayPerson = person.user && person.user.toString() === member._id.toString();
              const message = isBirthdayPerson
                ? `Happy Birthday, ${person.name}! 🎂 Add a memory to celebrate.`
                : `Today is ${person.name}'s birthday! 🎂`;

              await createNotification({
                recipient: member._id,
                sender: member._id,
                type: 'birthday_alert',
                payload: {
                  personId: person._id,
                  message: message
                }
              });
              console.log(`   -> Sent Birthday alert to ${member.username}`);
            }
          }
        }
      }

    } catch (err) {
      console.error("Daily Cron Failed:", err);
    }
  });
};   