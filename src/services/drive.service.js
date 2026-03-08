require("dotenv").config();
const { google } = require("googleapis");
const path = require("node:path");
const fs = require("node:fs");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000",
);
oauth2Client.setCredentials({
  access_token: process.env.GOOGLE_ACCESS_TOKEN,
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});
oauth2Client.on("tokens", (tokens) => {
  if (tokens.access_token) {
    process.env.GOOGLE_ACCESS_TOKEN = tokens.access_token;
  }
});
const drive = google.drive({ version: "v3", auth: oauth2Client });

const upLoadDrive = async (filePath) => {
  const res = await drive.files.create({
    requestBody: {
      name: path.basename(filePath),
      mimeType: "application/octet-stream",
    },
    media: {
      mimeType: "application/octet-stream",
      body: fs.createReadStream(filePath),
    },
    fields: "id, name, webViewLink",
  });
  return res.data;
};

module.exports = { drive, upLoadDrive };
