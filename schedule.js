const { CronJob } = require("cron");
const backupDB = require("./src/schedulers/backupDB");
const cleanupExpiredTokens = require("./src/schedulers/cleanupExpiredTokens");

// CronJob.from({
//   cronTime: "* * * * * *",
//   onTick: backupDB,
// }).start();

//  auto delete revoked tokens
CronJob.from({
  cronTime: "*/5 * * * * *",
  onTick: cleanupExpiredTokens,
}).start();
