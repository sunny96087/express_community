const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "公告標題未填寫"],
    },
    content: {
      type: String, // 內文可以存儲 HTML 內容
      required: [true, "公告內文未填寫"],
    },
    status: {
      type: Number,
      enum: [0, 1], // 0 表示草稿，1 表示已發布
      default: 0, // 預設為草稿狀態
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 參考 User 模型
      required: true, // 表示每個公告都必須與一個用戶相關聯
    },
    tag: {
      type: String,
      enum: ["公告", "功能", "其他"],
      default: "公告",
    },
    views: {
      type: Number,
      default: 0, // 預設為 0
    },
  },
  {
    versionKey: false, // 禁用 __v 欄位
    timestamps: true, // 自動添加 createdAt 和 updatedAt 欄位
  }
);

// 文本索引
announcementSchema.index({ title: 'text', content: 'text' });

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;
