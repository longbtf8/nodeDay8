const { CronJob } = require("cron");
require("dotenv").config();
const backupDB = require("./src/schedulers/backupDB");
const cleanupExpiredTokens = require("./src/schedulers/cleanupExpiredTokens");

CronJob.from({
  cronTime: "0 2 * * *",
  onTick: backupDB,
}).start();

//  auto delete revoked tokens
// CronJob.from({
//   cronTime: "*/5 * * * * *",
//   onTick: cleanupExpiredTokens,
// }).start();
