// routes/announcements.js

const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const { isAuth } = require("../utils/auth");
const handleErrorAsync = require("../utils/handleErrorAsync");

// POST /announcements 新增公告
router.post(
  "/",
  isAuth,
  handleErrorAsync(announcementController.createAnnouncement)
);

// GET /announcements/admin 後台管理員取回所有公告
router.get(
  "/admin",
  isAuth,
  handleErrorAsync(announcementController.getAllAnnouncementsForAdmin)
);

// PUT /announcements/:id 編輯公告
router.put(
  "/announcements/:id",
  isAuth,
  handleErrorAsync(announcementController.editAnnouncement)
);

// DELETE /announcements/:id 刪除公告
router.delete(
  "/announcements/:id",
  isAuth,
  handleErrorAsync(announcementController.deleteAnnouncement)
);

// GET /announcements/all 前台使用者取回所有公告
router.get(
  "/all",
  handleErrorAsync(announcementController.getAllAnnouncementsForUser)
);

// PUT /announcements/:id/views 增加公告瀏覽次數
router.put(
  "/announcements/:id/views",
  handleErrorAsync(announcementController.increaseAnnouncementViews)
);

module.exports = router;
