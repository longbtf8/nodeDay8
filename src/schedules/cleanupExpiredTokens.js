require("module-alias/register");
const db = require("@/config/database");

async function cleanupExpiredTokens() {
  const result = await db.query(
    "delete from revoked_tokens where expires_at < now()",
  );
  console.log(result);
}
module.exports = cleanupExpiredTokens;
