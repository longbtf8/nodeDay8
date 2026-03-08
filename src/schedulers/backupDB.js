require("module-alias/register");
const { exec } = require("node:child_process");
const util = require("util");
const dbConfig = require("../config/db.config");
const { getYmdHms } = require("../utils/time");
const { upLoadDrive } = require("@/services/drive.service");
const mailService = require("@/services/mail.service");
const execPromise = util.promisify(exec);

async function backupDB() {
  const { user, host, password, port, database } = dbConfig;
  console.log(password);
  const currentTime = getYmdHms();
  const { backupLocalDir, backupRemote, backupRemoteDir } = dbConfig;
  const BackupCMD = `mysqldump -u${user} -p${password} -h${host} -P${port} ${database} > ${backupLocalDir}/${database}_${currentTime}.sql`;
  const localFilePath = `${backupLocalDir}/${database}_${currentTime}.sql`;

  try {
    await execPromise(BackupCMD);

    console.log("BackUp DB Successfully");

    //copy to drive
    // const copyCommand = `rclone copy ${backupLocalDir} ${backupRemote}:${backupRemoteDir}`;
    // await execPromise(copyCommand);
    const file = await upLoadDrive(localFilePath);
    console.log("[BackupDB] Upload xong:", file.webViewLink);

    console.log("UpLoad to Google Drive Successfully");
    // Gửi email thông báo thành công
    await mailService.sendBackupSuccessEmail({
      fileName: file.name,
      fileLink: file.webViewLink,
      time: new Date().toLocaleString("vi-VN"),
    });
  } catch (error) {
    await mailService.sendBackupFailedEmail({
      error: error.message,
      time: new Date().toLocaleString("vi-VN"),
    });
    console.log(error);
  }
}
module.exports = backupDB;
