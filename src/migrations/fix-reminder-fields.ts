/**
 * One-time migration: set reminder24hSent and reminder2hSent from `false` → `null`
 * for all existing booking documents so they are compatible with the Date | null schema.
 *
 * Run once:  npx ts-node src/migrations/fix-reminder-fields.ts
 */
import mongoose from "mongoose";
import { envVars } from "../app/config";

const run = async () => {
  await mongoose.connect(envVars.DB_URL as string);
  console.log("Connected to MongoDB");

  const result = await mongoose.connection.collection("bookings").updateMany(
    {
      $or: [
        { reminder24hSent: false },
        { reminder2hSent: false },
      ],
    },
    [
      {
        $set: {
          reminder24hSent: {
            $cond: [{ $eq: ["$reminder24hSent", false] }, null, "$reminder24hSent"],
          },
          reminder2hSent: {
            $cond: [{ $eq: ["$reminder2hSent", false] }, null, "$reminder2hSent"],
          },
        },
      },
    ],
  );

  console.log(`Updated ${result.modifiedCount} booking(s)`);
  await mongoose.disconnect();
  console.log("Done");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
