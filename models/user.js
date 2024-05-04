const mongoose = require("mongoose");

// 定義使用者模型
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "使用者名稱未填寫"], // 設定必填 true, 後面帶上錯誤訊息
    },
    gender: {
      type: Number,
      enum: [1, 2, 3], // 限制性別選項 (1:male, 2:female, 3:other)
      default: null,
    },
    email: {
      type: String,
      required: [true, "信箱未填寫"],
      unique: true, // 確保信箱是唯一的
    },
    googleId: String,
    password: {
      type: String,
      // required: [true, "密碼未填寫"],
      select: false,
    },
    birthday: {
      type: Date,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    following: [
      // 我追蹤的用戶
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    followers: [
      // 追蹤我的用戶
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    emailVerified: {
      type: Boolean,
      default: false,
    }, // 是否有驗證信箱
    emailVerificationToken: String, // 信箱驗證 token
    emailVerificationTokenExpires: Date, // 信箱驗證 token 過期時間
    isAdmin: {
      // 管理員
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false, // 禁用 __v 欄位
    timestamps: true, // 自動添加 createdAt 和 updatedAt 欄位
  }
);

// 判斷用戶 googleId 是否存在 ⇒ 決定要登入還是註冊
userSchema.statics.findOrCreate = async function (doc) {
  let result = await this.findOne({ googleId: doc.googleId });
  if (result) {
    return result;
  } else {
    result = new this(doc);
    return await result.save();
  }
};

// 創建使用者模型
const User = mongoose.model("User", userSchema);

// 導出
module.exports = User;
