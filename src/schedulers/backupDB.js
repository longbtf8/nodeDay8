const { exec } = require("node:child_process");
const util = require("util");
const dbConfig = require("../config/db.config");
const { getYmdHms } = require("../utils/time");
const execPromise = util.promisify(exec);

async function backupDB() {
  const { user, host, password, port, database } = dbConfig;
  console.log(password);
  const currentTime = getYmdHms();
  const { backupLocalDir, backupRemote, backupRemoteDir } = dbConfig;
  const BackupCMD = `mysqldump -u${user} -p${password} -h${host} -P${port} ${database} > ${backupLocalDir}/${database}_${currentTime}.sql`;

  try {
    await execPromise(BackupCMD);

    console.log("BackUp DB Successfully");

    //copy to drive
    const copyCommand = `rclone copy ${backupLocalDir} ${backupRemote}:${backupRemoteDir}`;
    await execPromise(copyCommand);
    console.log("UpLoad to Google Drive Successfully");
  } catch (error) {
    return console.log(error);
  }
}
module.exports = backupDB;
