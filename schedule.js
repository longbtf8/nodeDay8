const { CronJob } = require("cron");
require("dotenv").config();
const backupDB = require("./src/schedulers/backupDB");
const cleanupExpiredTokens = require("./src/schedulers/cleanupExpiredTokens");

CronJob.from({
  cronTime: " 0 3 * * *",
  onTick: backupDB,
}).start();

//  auto delete revoked tokens
CronJob.from({
  cronTime: " 0 1 * * *",
  onTick: cleanupExpiredTokens,
}).start();
