require("module-alias/register");
require("dotenv").config();

const { jobStatus } = require("@/config/constants");
const tasks = require("@/tasks");
const queueService = require("@/services/queue.service");
const sleep = require("@/utils/sleep");

(async () => {
  while (true) {
    const firstJob = await queueService.getPendingJob();
    if (firstJob) {
      const { id, type, payload: jsonPayload } = firstJob;
      console.log("Job found:", firstJob);
      try {
        const payload = JSON.parse(jsonPayload);

        //update status :"inprogress"
        queueService.updateStatus(id, jobStatus.inprogress);

        console.log(`Job "${type} inprogress."`);

        const handle = tasks[type];
        if (handle) {
          await handle(payload);
        } else {
          console.log("Chưa có logic sử lý cho job", type);
        }
        console.log(`Job "${type} completed."`);
        queueService.updateStatus(id, jobStatus.completed);
      } catch (error) {
        console.log(`Job "${type} failed."`);
        const info = JSON.stringify({
          message: String(error),
        });
        queueService.updateStatus(id, jobStatus.failed, info);
      }
    }
    await sleep(3000);
  }
})();
