// routes/email.js

var express = require("express");
const emailController = require("../controllers/emailController");
const handleErrorAsync = require("../utils/handleErrorAsync");

const router = express.Router();

router.post(
  "/personalMail",
  emailController.sendPersonalMail
  // #swagger.tags = ['Email']
  // #swagger.description = '發送信件測試'
);

// 處理註冊電子郵件驗證用的路由
router.get(
  "/verify-email",emailController.verifyEmail
  // #swagger.tags = ['Email']
  // #swagger.description = '處理註冊電子郵件驗證用的路由'
);

module.exports = router;
