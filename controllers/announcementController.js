// controllers/announcementController.js

const Announcement = require("../models/announcement");
const User = require("../models/user");
const handleSuccess = require("../utils/handleSuccess"); // 假設您已經有一個 handleSuccess 函數來處理成功的回應
const appError = require("../utils/appError"); // 假設您已經有一個 appError 函數來處理錯誤
const dayjs = require("dayjs");

const announcementController = {
  // 新增公告
  createAnnouncement: async function (req, res, next) {
    const { title, content, status, tag } = req.body;
    if (!title || !content) {
      return next(appError(400, "公告標題和內容是必填項"));
    }

    // 從 token 拿 id
    const id = req.user.id;

    // 從 token 拿 isAdmin
    const isAdmin = req.user.isAdmin;
    if (!isAdmin) {
      return next(appError(400, "您沒有權限新增公告"));
    }

    // 儲存到資料庫
    const announcement = await Announcement.create({
      title,
      content,
      user: id,
      status,
      tag,
    });

    handleSuccess(res, announcement, "新增公告成功");
  },

  // 後台管理員取回所有公告
  getAllAnnouncementsForAdmin: async function (req, res, next) {
    // 從 token 拿 isAdmin
    const isAdmin = req.user.isAdmin;
    if (!isAdmin) {
      return next(appError(400, "您沒有權限新增公告"));
    }

    const announcements = await Announcement.find().populate(
      "user",
      "name avatar"
    );

    // 格式化時間
    const formattedAnnouncements = announcements.map((announcement) => {
      const announcementObj = announcement.toObject();
      return {
        ...announcementObj,
        createdAt: dayjs(announcementObj.createdAt).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        updatedAt: dayjs(announcementObj.updatedAt).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
      };
    });

    handleSuccess(res, formattedAnnouncements, "取得所有公告成功");
  },

  // 後台管理員編輯公告
  editAnnouncement: async function (req, res, next) {
    // 從 token 拿 isAdmin
    const isAdmin = req.user.isAdmin;
    if (!isAdmin) {
      return next(appError(400, "您沒有權限編輯公告"));
    }

    // 從請求參數中獲取公告 ID
    const announcementId = req.params.id;

    // 從請求體中獲取要更新的欄位
    const { title, content, status, tag } = req.body;

    // 更新公告
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      announcementId,
      {
        title,
        content,
        status,
        tag,
      },
      { new: true } // 這個選項讓 Mongoose 返回更新後的文檔
    );

    if (!updatedAnnouncement) {
      return next(appError(404, "找不到該公告"));
    }

    handleSuccess(res, updatedAnnouncement, "編輯公告成功");
  },

  // 後台管理員刪除單筆公告
  deleteAnnouncement: async function (req, res, next) {
    // 從 token 拿 isAdmin
    const isAdmin = req.user.isAdmin;
    if (!isAdmin) {
      return next(appError(400, "您沒有權限刪除公告"));
    }

    // 從請求參數中獲取公告 ID
    const announcementId = req.params.id;

    // 刪除公告
    const deletedAnnouncement = await Announcement.findByIdAndDelete(
      announcementId
    );

    if (!deletedAnnouncement) {
      return next(appError(404, "找不到該公告"));
    }

    handleSuccess(res, deletedAnnouncement, "刪除公告成功");
  },

  // 前台使用者取回所有公告
  getAllAnnouncementsForUser: async function (req, res, next) {
    // 從請求中獲取參數
    const { sort, tag, keyword } = req.query;

    // 初始化查詢對象
    let query = { status: 1 }; // 只取回狀態為 1 的公告

    // 根據標籤過濾
    if (tag) {
      query.tag = tag; // 假設您的公告模型中有一個 tag 欄位
    }

    // 根據關鍵字過濾
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } },
      ];
    }

    // 根據排序參數排序
    let sortOption = {};
    if (sort === "oldest") {
      sortOption.createdAt = 1;
    } else {
      // 預設排序為由新到舊
      sortOption.createdAt = -1;
    }

    // 執行查詢
    const announcements = await Announcement.find(query, "-status")
      .sort(sortOption)
      .populate("user", "name avatar");

    // 格式化日期
    const formattedAnnouncements = announcements.map((announcements) => {
      const announcementObj = announcements.toObject();
      return {
        ...announcementObj,
        createdAt: dayjs(announcementObj.createdAt).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        updatedAt: dayjs(announcementObj.updatedAt).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
      };
    });

    handleSuccess(res, formattedAnnouncements, "取得所有公告成功");
  },

  // 增加公告的檢視次數
  increaseAnnouncementViews: async function (req, res, next) {
    try {
      // 從請求參數中獲取公告 ID
      const announcementId = req.params.id;

      // 增加公告的檢視次數
      const updatedAnnouncement = await Announcement.findByIdAndUpdate(
        announcementId,
        { $inc: { views: 1 } }, // 使用 $inc 操作符來增加 views 欄位的值
        { new: true } // 這個選項讓 Mongoose 返回更新後的文檔
      );

      if (!updatedAnnouncement) {
        return next(appError(404, "找不到該公告"));
      }

      handleSuccess(res, updatedAnnouncement, "公告檢視次數增加成功");
    } catch (err) {
      return next(appError(500, "更新公告檢視次數失敗"));
    }
  },
};

module.exports = announcementController;
