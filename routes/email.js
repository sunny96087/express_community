var express = require("express");
const appError = require("../utils/appError");
const handleErrorAsync = require("../utils/handleErrorAsync");
const handleSuccess = require("../utils/handleSuccess");

const router = express.Router();
const validator = require("validator");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

router.post(
  "/personalMail",
  handleErrorAsync(async function (req, res, next) {
    const { to, subject, text } = req.body;
    // 內容不可為空
    if (!to || !subject | !text) {
      return next(appError(400, "欄位未填寫正確！"));
    }
    // 是否為 Email
    if (!validator.isEmail(to)) {
      return next(appError(400, "Email 格式不正確"));
    }

    // 讓 Google 驗證專案
    const oauth2Client = new OAuth2(
      process.env.GOOGLE_AUTH_CLIENTID,
      process.env.GOOGLE_AUTH_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_AUTH_REFRESH_TOKEN,
    });

    // 取得 一次性的 access token
    const accessToken = oauth2Client.getAccessToken();

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "yu13142013@gmail.com",
        clientId: process.env.GOOGLE_AUTH_CLIENTID,
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_AUTH_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "2魚 <yu13142013@gmail.com>",
      to, // 寄給誰
      subject, // 信件標題
      text, // 信件內容
    };

    await transporter.sendMail(mailOptions);

    handleSuccess(res, mailOptions, "信件發送成功");
  })
);

module.exports = router;
