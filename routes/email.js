// routes/email.js

var express = require("express");
const emailController = require("../controllers/emailController");

const router = express.Router();

router.post(
 "/personalMail",
 emailController.sendPersonalMail
);

module.exports = router;