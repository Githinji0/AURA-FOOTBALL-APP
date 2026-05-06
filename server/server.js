import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { ENV } from "./src/config/env.js";
import { startScheduler } from "./src/jobs/scheduler.js";

const start = async () => {
  await connectDB();
  startScheduler();

  app.listen(ENV.PORT, () => {
    console.log(`🚀 Server running on port ${ENV.PORT}`);
  });
};

start();