import { Handler, schedule } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:example@yourdomain.org",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

const myHandler: Handler = async (event, context) => {
  try {
    const now = new Date();
    // UTC+7 Adjustment (Vietnam Time)
    const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const h = vnTime.getUTCHours().toString().padStart(2, '0');
    const m = vnTime.getUTCMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${h}:${m}`;

    console.log(`Checking reminders for ${currentTimeStr} (VN Time)`);

    // 1. Fetch matching medications
    const { data: meds, error: medsError } = await supabase
      .from('medications')
      .select('user_id, name, times, days, start_date, end_date');

    if (medsError) throw medsError;

    const dateStr = vnTime.toISOString().split('T')[0];
    const dayNames = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];
    const currentDayName = dayNames[vnTime.getUTCDay()];

    // 2. Filter meds that match current time
    const userReminders: Record<string, string[]> = {};
    meds.forEach(med => {
      const mTimes = Array.isArray(med.times) ? med.times : [];
      const mDays = Array.isArray(med.days) ? med.days : [];
      const mStart = med.start_date;
      const mEnd = med.end_date;

      // Date range check
      if (mStart && dateStr < mStart) return;
      if (mEnd && dateStr > mEnd) return;
      
      // Day of week check
      if (mDays.length > 0 && !mDays.includes(currentDayName)) return;

      if (mTimes.includes(currentTimeStr)) {
        const uid = med.user_id;
        if (!userReminders[uid]) userReminders[uid] = [];
        userReminders[uid].push(med.name);
      }
    });

    const userIds = Object.keys(userReminders);
    if (userIds.length === 0) {
      return { statusCode: 200, body: "No reminders due" };
    }

    // 3. Fetch subscriptions for these users
    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('user_id, subscription')
      .in('user_id', userIds);

    if (subsError) throw subsError;

    // 4. Send notifications
    const sentCount = 0;
    for (const sub of subs) {
      const medsToNotify = userReminders[sub.user_id];
      if (!medsToNotify) continue;

      const payload = JSON.stringify({
        title: "Đến giờ uống thuốc",
        body: `Bạn cần uống: ${medsToNotify.join(", ")}`,
        url: "/medications"
      });

      try {
        await webpush.sendNotification(sub.subscription, payload);
      } catch (err) {
        console.error(`Push failed for user ${sub.user_id}:`, err);
      }
    }

    return {
      statusCode: 200,
      body: `Processed reminders for ${userIds.length} users`,
    };
  } catch (e: any) {
    console.error("Reminder function error:", e);
    return { statusCode: 500, body: e.message };
  }
};

export const handler = schedule("* * * * *", myHandler);
