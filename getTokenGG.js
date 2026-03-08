require("dotenv").config();
const { google } = require("googleapis");
const readline = require("readline");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000",
);

const scopes = ["https://www.googleapis.com/auth/drive"];

console.log(process.env.GOOGLE_CLIENT_ID);
const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
});
console.log("Truy cập URL này trên browser:\n", url);
(async () => {
  const code =
    "4/0AfrIepA9a0GB7M4_fE_v5dQzz5Vx4Na1oNqv4fcXU6P517CuV7y0HU1_9J5CFdzbt3wCnw";
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  console.log(tokens);
})();
