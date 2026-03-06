const authConfig = require("@/config/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const randomKey = require("@/utils/randomKey");
const authModel = require("@/models/auth.model");
const db = require("@/config/database");
const appConfig = require("@/config/app.config");
const queueService = require("./queue.service");

class AuthService {
  async signAccessToken(id) {
    const ttl = authConfig.accessTokenTTL;
    console.log(ttl);
    const accessToken = await jwt.sign(
      {
        sub: id,
        exp: parseInt(Date.now() / 1000 + ttl),
      },
      process.env.AUTH_JWT_SECRET,
    );
    return accessToken;
  }
  async verifyAccessToken(accessToken) {
    const payload = jwt.verify(accessToken, authConfig.jwtSecret);
    return payload;
  }
  async createRefreshToken(user, userAgent) {
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + authConfig.refreshTokenTTL);
    let refreshToken,
      isExists = false;
    do {
      refreshToken = randomKey();
      const [[{ count }]] = await db.query(
        "select count(*) as count from refresh_tokens where token=?",
        [refreshToken],
      );
      isExists = count > 0;
    } while (isExists);
    await authModel.insertRefreshToken(
      user.id,
      refreshToken,
      expires_at,
      userAgent,
    );
    return refreshToken;
  }
  generateVerificationLink(user) {
    const payload = {
      sub: user.id,
      exp: Date.now() / 1000 + authConfig.verifyTokenTTL,
    };
    const token = jwt.sign(payload, authConfig.verificationJwtSecret);
    const verificationLink = `${appConfig.url}/verify-email?token=${token}`;
    return verificationLink;
  }
  async verifyEmail(token) {
    try {
      const payload = jwt.verify(token, authConfig.verificationJwtSecret);
      if (payload.exp < Date.now() / 1000) {
        return [true, null];
      }
      const userId = payload.sub;
      const [[{ count }]] = await db.query(
        "select count(*) as count from users where id = ? and email_verified_at is not null",
        [userId],
      );
      if (count > 0) {
        return [true, null];
      }
      await db.query(
        "update users set email_verified_at = now() where id =? ",
        [userId],
      );
      return [false, null];
    } catch (error) {
      console.log(error);
      return [true, null];
    }
  }
  async changePassword(user, password, newPassword, confirm_password) {
    if (!password || !newPassword || !confirm_password) {
      return [
        {
          message: "Vui lòng nhập đủ tất cả các trường",
          error: true,
        },
        null,
      ];
    }

    if (newPassword !== confirm_password) {
      return [
        {
          message: "Mật khẩu mới và xác nhận không khớp nhau",
          error: true,
        },
        null,
      ];
    }

    // check password hiện tại
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return [
        {
          message: "Mật khẩu hiện tại không chính xác",
          error: true,
        },
        null,
      ];
    }

    // check mật khẩu mới giống mật khẩu hiện tại
    const isNewPasswordSameAsCurrent = await bcrypt.compare(
      newPassword,
      user.password,
    );
    if (isNewPasswordSameAsCurrent) {
      return [
        {
          message: "Mật khẩu mới không được giống mật khẩu hiện tại",
          error: true,
        },
        null,
      ];
    }

    const hash = await bcrypt.hash(newPassword, authConfig.saltRounds);

    await db.query("update users set password = ? where id=?", [hash, user.id]);

    await queueService.push("sendPasswordChangeEmail", {
      id: user.id,
      email: user.email,
    });
    return [{ error: false }, null];
  }
}
module.exports = new AuthService();
