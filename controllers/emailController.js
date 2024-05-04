// controllers/emailController.js

const validator = require("validator");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const appError = require("../utils/appError");
const handleSuccess = require("../utils/handleSuccess");
const User = require("../models/user");

const emailController = {
  sendPersonalMail: async (req, res, next) => {
    const { to, subject, text } = req.body;
    // 內容不可為空
    if (!to || !subject || !text) {
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
  },

  //  註冊驗證的 email 發送
  verifyEmail: async (req, res, next) => {
    const user = await User.findOne({
      emailVerificationToken: req.query.token,
      emailVerificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(appError(400, "驗證鏈接無效或已過期。"));
    }

    // 將用戶的電子郵件地址標記為已驗證
    await User.findByIdAndUpdate(user._id, {
      emailVerified: true,
      $unset: {
        emailVerificationToken: "", // 移除 emailVerificationToken 欄位
        emailVerificationTokenExpires: "", // 移除 emailVerificationTokenExpires 欄位
      },
      //   emailVerificationToken: undefined,
      //   emailVerificationTokenExpires: undefined,
    });

    // handleSuccess(res, null, "您的電子郵件地址已成功驗證！");

    // 發送一個包含特定內容和按鈕的 HTML 響應
    res.send(`
        <html>
          <head>
            <title>驗證成功</title>
          </head>
          <body style="background-color: #F0ECE8; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="text-align: left;>
                    <p style="font-size: 24px; margin-bottom: 20px;">您的電子郵件地址已成功驗證！</p>
                    <button onclick="goToHomePage()" style="background-color: #04438D; color: white; padding: 12px 24px; border: 2px solid #000400; border-radius: .5rem; font-size: 20px; cursor: pointer;box-shadow: -2px 2px #000400;font-weight: 700;">回網站登入</button>
                </div> 
            <script>
              function goToHomePage() {
                window.location.href = "https://community-web-4l2.pages.dev/login/";
              }
            </script>
          </body>
        </html>
      `);
  },
};

module.exports = emailController;
