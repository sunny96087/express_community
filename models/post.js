const mongoose = require("mongoose");
const User = require("./user"); // 引入 Post 模型

// 定義一個操控特定 collection 的 modal => const ___ = new mongoose.Schema({ 定義欄位限制 });
const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Content 未填寫"], // 設定必填 true, 後面帶上錯誤訊息
    },
    image: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // select: false, // 搜尋時不顯示
    },
    // name: {
    //   type: String,
    //   required: [true, "貼文姓名未填寫"],
    // },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [{   // 存儲點讚的用戶 ID
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 引用 User 模型
      required: [true, "用戶 ID 是必需的。"],
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    versionKey: false, // 禁用 __v 欄位
  }
);

// 為 content 和 name 字段添加全文索引
// postSchema.index({ content: 'text', name: 'text' });
postSchema.index({ content: 'text' });

//                          集合名稱 單數 讓他自己加 s
const Post = mongoose.model("Post", postSchema);

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "留言內容未填寫"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 引用 User 模型
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", // 引用 Post 模型
      required: true,
    }
  },
  {
    versionKey: false, // 禁用 __v 欄位
  }
);

const Comment = mongoose.model("Comment", commentSchema);

// 導出
module.exports = { Post, Comment };
