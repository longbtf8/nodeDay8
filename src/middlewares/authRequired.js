const authConfig = require("@/config/auth");
const db = require("@/config/database");
const authService = require("@/services/auth.service");

async function authRequired(req, res, next) {
  const accessToken = req.headers?.authorization?.slice(6).trim();

  if (!accessToken) return res.error(401, null, "Unauthorized");

  const TokenPayload = await authService.verifyAccessToken(accessToken);

  //check blacklist
  const [[{ count }]] = await db.query(
    `select count(*) as count from revoked_tokens where token=?`,
    [accessToken],
  );

  if (count > 0 || TokenPayload.exp < Math.floor(Date.now() / 1000)) {
    return res.error(401, null, "Unauthorized");
  }
  const [users] = await db.query(
    `select id,email,password,created_at from users where id=?`,
    [TokenPayload.sub],
  );
  const user = users[0];
  if (!user) {
    return res.error(401, null, "Unauthorized");
  }
  req.currentUser = user;
  req.accessToken = accessToken;
  req.tokenPayload = TokenPayload;
  next();
}
module.exports = authRequired;
