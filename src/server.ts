import { createServer, Server } from 'http';
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config";
import { adminSeed } from "./app/utils/seedAdmin";
import { connectRedis } from "./app/config/redis.config";
import { startPayoutCron } from "./app/cron/payoutCron";
import { startBookingCron } from "./app/cron/bookingCron";
import { startReminderCron } from "./app/cron/reminderCron";
import { logger } from "./app/utils/logger";
import colors from 'colors';

let server: Server;

const main = async () => {
  try {
    const dbStartTime = Date.now();
    const loadingFrames = ["🌍", "🌎", "🌏"]; // Loader animation frames
    let frameIndex = 0;

    // Start the connecting animation
    const loader = setInterval(() => {
      process.stdout.write(
        `\rMongoDB connecting ${loadingFrames[frameIndex]} Please wait 😢`,
      );
      frameIndex = (frameIndex + 1) % loadingFrames.length;
    }, 300); // Update frame every 300ms


        // Connect to MongoDB with a timeout
    await mongoose.connect(envVars.DB_URL as string, {
      connectTimeoutMS: 10000, // 10 seconds timeout
    });

        // Stop the connecting animation
    clearInterval(loader);
    logger.info(
      `\r✅ Mongodb connected successfully in ${Date.now() - dbStartTime}ms`,
    );

    connectRedis();
    adminSeed();
    startPayoutCron(); // runs every Sunday 8AM (or every minute in test mode)
    startBookingCron(); // runs every hour — marks past bookings as completed
    startReminderCron(); // runs every hour — sends reminder emails for upcoming classes


    // Start HTTP server
    server = createServer(app);

    server.listen(Number(envVars.PORT), () => {
      
      console.log(
        colors.green(`---> Lenguable server is listening on  : http://${envVars.IP}:${envVars.PORT}`).bold,
      );

    });

  } catch (error) {
    console.log(error);
  }
};
main();
