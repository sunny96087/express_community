const express = require("express"); // 引入 Express 框架
const dayjs = require("dayjs");
const tools = require("../utils/tools");
const appError = require("../utils/appError");
const handleSuccess = require("../utils/handleSuccess"); // 引入自訂的成功處理工具
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuth, generateSendJWT } = require("../utils/auth");
const User = require("../models/user"); // 引入 Post 模型
const { Post, Comment } = require("../models/post");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_AUTH_CLIENTID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: "http://localhost:3666/users/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      console.log("測試");
      console.log(profile);
      try {
        const user = await User.findOrCreate({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
        });
        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    }
  )
);

const usersController = {
  // 取得全部使用者
  getUsers: async function (req, res, next) {
    const user = await User.find(); // 查詢所有資料
    handleSuccess(res, user, "取得所有資料成功");
  },

  // 獲取特定使用者
  getUser: async function (req, res, next) {
    const id = req.user.id;

    const user = await User.findById(id).select(
      "-createdAt -updatedAt -email "
    );

    if (user) {
      handleSuccess(res, user, "取得單筆資料成功");
    } else {
      return next(appError(400, "找不到該使用者資料"));
    }
  },

  // 獲取特定使用者 公開資料
  getUserOpen: async function (req, res, next) {
    const id = req.params.id;

    const user = await User.findById(id).select(
      "-createdAt -updatedAt -email "
    );

    if (user) {
      handleSuccess(res, user, "取得單筆資料成功");
    } else {
      return next(appError(400, "找不到該使用者資料"));
    }
  },

  // 新增一位使用者
  createUser: async function (req, res, next) {
    let data = req.body;
    data = tools.trimObjectAllValues(data);

    if (data) {
      // 定義及檢查數據是否包含所有必填欄位
      const requiredFields = ["name", "email", "password"];
      const { isValid, missingFields } = tools.checkRequiredFields(
        data,
        requiredFields
      );
      if (!isValid) {
        return next(
          appError(400, `以下欄位為必填: ${missingFields.join(", ")}`)
        );
      }

      // 定義及檢查欄位內容不得為空
      const fieldsToCheck = ["name", "email", "password"];
      const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
      if (errorMessage) {
        return next(appError(400, errorMessage));
      }

      // 定義及提供的數據是否只包含了允許的欄位
      const allowedFields = ["name", "email", "password"];
      const invalidFieldsError = tools.validateFields(data, allowedFields);
      if (invalidFieldsError) {
        return next(appError(400, invalidFieldsError));
      }

      // 檢查 email 是否重複
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        return next(appError(400, "該 email 已經被註冊"));
      }

      const newUser = await User.create({
        // 創建新的資料
        name: data.name,
        email: data.email,
        password: data.password,
      });

      handleSuccess(res, newUser, "新增單筆資料成功"); // 如果成功，回應成功信息和新的資料
    } else {
      return next(appError(400, "請求體內容不得為空"));
    }
  },

  // 刪除全部使用者資料
  deleteAllUsers: async function (req, res, next) {
    // 刪除所有文章
    await Post.deleteMany({});

    // 刪除所有評論
    // 假設你有一個 Comment 模型，並且每個評論都有一個參考 Post 的欄位
    await Comment.deleteMany({});

    // 刪除所有使用者
    const data = await User.deleteMany({});

    handleSuccess(res, [], "刪除全部資料成功");
  },

  // 刪除指定 ID 使用者資料
  deleteUser: async function (req, res, next) {
    const id = req.params.id;

    const isIdExist = await tools.findModelByIdNext(User, id, next);
    if (!isIdExist) {
      return;
    }

    // 找到這個用戶的所有文章
    const userPosts = await Post.find({ userId: id });

    // 從所有相關用戶的 likedPosts 列表中移除這些文章的 ID
    await User.updateMany(
      { likedPosts: { $in: userPosts.map((post) => post._id) } },
      { $pull: { likedPosts: { $in: userPosts.map((post) => post._id) } } }
    );

    // 刪除用戶的文章
    await Post.deleteMany({ userId: id });

    // 刪除這些文章的所有留言
    // 假設你有一個 Comment 模型，並且每個留言都有一個參考 Post 的欄位
    await Comment.deleteMany({
      postId: { $in: userPosts.map((post) => post._id) },
    });

    // 從其他用戶的追蹤列表中移除這個用戶
    await User.updateMany(
      { following: { $elemMatch: { userId: id } } },
      { $pull: { following: { userId: id } } }
    );

    // 從其他用戶的追蹤者列表中移除這個用戶
    await User.updateMany(
      { followers: { $elemMatch: { userId: id } } },
      { $pull: { followers: { userId: id } } }
    );

    // 刪除用戶本身
    await User.findByIdAndDelete(id);

    handleSuccess(res, null, "刪除單筆資料成功");
  },

  // 修改指定 ID 使用者資料
  updateUser: async function (req, res, next) {
    const id = req.user.id;
    // const id = req.params.id;
    let data = req.body;

    // 使用 trimObjectValues 函數來去掉資料中所有值的空格
    data = tools.trimObjectAllValues(data);

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(User, id, next);
    if (!isIdExist) {
      return;
    }

    // 使用 hasDataChanged 函數來檢查資料是否有改變
    const oldData = await User.findById(id);
    if (!tools.hasDataChanged(oldData, data)) {
      return next(appError(400, "資料未變更"));
    }

    // 定義及檢查欄位內容不得為空
    const fieldsToCheck = ["name"];
    const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
    if (errorMessage) {
      return next(appError(400, errorMessage));
    }

    // 定義及提供的數據是否只包含了允許的欄位
    const allowedFields = [
      "name",
      "gender",
      "email",
      "password",
      "birthday",
      "avatar",
    ];
    const invalidFieldsError = tools.validateFields(data, allowedFields);
    if (invalidFieldsError) {
      return next(appError(400, invalidFieldsError));
    }

    const updatedUser = await User.findByIdAndUpdate(
      // 更新指定 ID 的資料
      id,
      {
        name: data.name,
        content: data.content,
        email: data.email,
        password: data.password,
        birthday: data.birthday,
        avatar: data.avatar,
        gender: data.gender,
      },
      { new: true }
    );

    if (updatedUser) {
      // 如果更新成功
      handleSuccess(res, updatedUser, "更新單筆資料成功"); // 回應成功
    } else {
      return next(appError(400, "資料更新失敗"));
    }
  },

  // 取得指定 ID 的使用者按讚文章資料
  getLikedPosts: async function (req, res, next) {
    const id = req.params.id;

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(User, id, next);
    if (!isIdExist) {
      return;
    }

    // 使用 populate 方法來取回使用者資料及使用者追蹤清單
    // 並且在 following 欄位中的 userId 欄位取得對應的使用者名稱和頭像
    const user = await User.findById(id)
      .populate({
        path: "likedPosts",
        select: "content image createdAt likes userId",
        populate: {
          path: "userId", // 填充 likedPosts 中的 userId 欄位
          select: "avatar name", // 只取得這些欄位
        },
      })
      .select("-createdAt -updatedAt");

    if (!user) {
      return next(appError(400, "使用者不存在"));
    }

    // 格式化 likedPosts 欄位中的 createdAt 日期
    const formattedUser = {
      ...user.toObject(),
      likedPosts: user.likedPosts.map((post) => {
        return {
          ...post.toObject(),
          createdAt: dayjs(post.createdAt).format("YYYY-MM-DD HH:mm"),
        };
      }),
    };

    handleSuccess(res, formattedUser, "取得單筆資料成功");
  },

  // 追蹤或取消追蹤用戶
  followUser: async function (req, res, next) {
    const { id } = req.params; // 獲取要追蹤或取消追蹤的用戶ID
    // const userId = req.body.userId; // 獲取當前用戶ID
    const userId = req.user.id; // 從 token 中獲取當前用戶ID

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(User, id, next);
    if (!isIdExist) {
      return;
    }
    const isUserIdExist = await tools.findModelByIdNext(User, userId, next);
    if (!isUserIdExist) {
      return;
    }

    // 檢查要追蹤或取消追蹤的用戶是否存在
    const userToFollow = await User.findById(id);
    if (!userToFollow) {
      return next(appError(400, "要追蹤或取消追蹤的用戶不存在"));
    }

    // 檢查當前用戶是否已經追蹤了要追蹤的用戶
    const currentUser = await User.findById(userId);
    const isFollowing = currentUser.following.some(
      (follow) => follow.userId && follow.userId.toString() === id
    );

    // 根據當前用戶是否已經追蹤了要追蹤的用戶來更新 following 欄位
    if (isFollowing) {
      // 如果已經追蹤了，則取消追蹤
      await User.updateOne(
        { _id: userId },
        { $pull: { following: { userId: id } } }
      );
      // 同時將當前用戶從該用戶的 followers 清單中移除
      await User.updateOne(
        { _id: id },
        { $pull: { followers: { userId: userId } } }
      );
      handleSuccess(res, null, "取消追蹤成功");
    } else {
      // 如果尚未追蹤，則追蹤
      await User.updateOne(
        { _id: userId },
        { $push: { following: { userId: id, createdAt: new Date() } } }
      );
      // 同時將當前用戶加入到該用戶的 followers 清單中
      await User.updateOne(
        { _id: id },
        { $push: { followers: { userId: userId, createdAt: new Date() } } }
      );
      handleSuccess(res, null, "追蹤成功");
    }
  },

  // 取得指定使用者 ID 的追蹤清單
  getFollows: async function (req, res, next) {
    // const id = req.params.id;
    const id = req.user.id;

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(User, id, next);
    if (!isIdExist) {
      return;
    }

    // 使用 populate 方法來取回使用者資料及使用者追蹤清單
    // 並且在 following 欄位中的 userId 欄位取得對應的使用者名稱和頭像
    const user = await User.findById(id)
      .populate({
        path: "following.userId", // 填充 following.userId 欄位
        select: "name avatar", // 只取得 name 和 avatar 欄位
      })
      .select("-createdAt -updatedAt");

    if (!user) {
      return next(appError(400, "使用者不存在"));
    }

    // 格式化 following 欄位中的 createdAt 日期
    const formattedUser = {
      ...user.toObject(),
      following: user.following
        .map((follow) => {
          // 檢查 userId 是否存在
          if (!follow.userId) {
            return null; // 或者返回一個預設的對象，或者直接跳過這個 follow
          }
          return {
            _id: follow._id,
            createdAt: dayjs(follow.createdAt).format("YYYY-MM-DD HH:mm"),
            userId: {
              name: follow.userId.name,
              avatar: follow.userId.avatar,
              id: follow.userId._id,
            },
          };
        })
        .filter((follow) => follow !== null), // 移除所有 null 的 follow
    };

    handleSuccess(res, formattedUser, "取得單筆資料成功");
  },

  // 註冊
  signUp: async function (req, res, next) {
    let data = req.body;

    // 使用 trimObjectValues 函數來去掉資料中所有值的空格
    data = tools.trimObjectAllValues(data);

    let { email, password, confirmPassword, name } = data;

    // 內容不可為空
    if (!email || !password || !confirmPassword || !name) {
      return next(appError("400", "欄位未填寫正確！"));
    }
    // 密碼正確
    if (password !== confirmPassword) {
      return next(appError("400", "密碼不一致！"));
    }
    // 密碼必須為英數混合且至少 8 碼
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return next(appError("400", "密碼必須為英數混合且至少 8 碼"));
    }
    // 是否為 Email
    if (!validator.isEmail(email)) {
      return next(appError("400", "Email 格式不正確"));
    }

    // 檢查 email 是否重複
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(appError(400, "該 email 已經被註冊"));
    }

    // 加密密碼
    password = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email,
      password,
      name,
    });

    // 註冊成功，不登入
    // handleSuccess(res, newUser, "註冊成功");

    // 發送 JWT (註冊完直接登入)
    generateSendJWT(newUser, 201, res);
  },

  // 新增的註冊方法，包括電子郵件驗證
  signUpWithEmailVerification: async function (req, res, next) {
    let data = req.body;

    // 使用 trimObjectValues 函數來去掉資料中所有值的空格
    data = tools.trimObjectAllValues(data);

    let { email, password, confirmPassword, name } = data;

    // 內容不可為空
    if (!email || !password || !confirmPassword || !name) {
      return next(appError("400", "欄位未填寫正確！"));
    }
    // 密碼正確
    if (password !== confirmPassword) {
      return next(appError("400", "密碼不一致！"));
    }
    // 密碼必須為英數混合且至少 8 碼
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return next(appError("400", "密碼必須為英數混合且至少 8 碼"));
    }
    // 是否為 Email
    if (!validator.isEmail(email)) {
      return next(appError("400", "Email 格式不正確"));
    }

    // 檢查 email 是否重複
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(appError(400, "該 email 已經被註冊"));
    }

    // 加密密碼
    password = await bcrypt.hash(password, 12);

    // 生成驗證標識符
    const token = crypto.randomBytes(20).toString("hex");
    // * dev
    // const verificationUrl = `http://localhost:3666/email/verify-email?token=${token}`;
    // * prod
    const verificationUrl = `https://express-community.onrender.com/email/verify-email?token=${token}`;

    // 創建新用戶並儲存驗證標識符
    const newUser = await User.create({
      email,
      password,
      name,
      emailVerificationToken: token,
      emailVerificationTokenExpires: new Date(Date.now() + 3600000), // 1 小時後過期
    });

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

    // 發送驗證郵件
    const mailOptions = {
      from: "雀特 Chat! - 社群網站 <yu13142013@gmail.com>",
      to: email,
      subject: "請驗證您的電子郵件地址",
      text: `請點擊以下鏈接來驗證您的電子郵件地址：\n\n${verificationUrl}\n\n如果您沒有註冊，請忽略此郵件。`,
    };

    await transporter.sendMail(mailOptions);

    // 回應註冊成功，但不直接登入
    handleSuccess(
      res,
      null,
      "註冊成功，請於一小時內至填寫的電子信箱驗證郵件。"
    );
  },

  // 確認 email 是否已註冊
  checkEmail: async function (req, res, next) {
    const email = req.params.email; // undefined
    console.log(email);

    const user = await User.findOne({ email });

    console.log(user); // null

    if (!user) {
      handleSuccess(res, null, "該 email 可以使用");
    } else {
      return next(appError(400, "該 email 已經被註冊"));
    }
  },

  // 登入
  signIn: async function (req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(appError(400, "帳號密碼不可為空"));
    }

    // 檢查 email 是否存在
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return next(appError(400, "帳號不存在"));
    }

    // 檢查用戶是否已經驗證了他們的電子郵件地址
    if (!existingUser.emailVerified) {
      return next(appError(400, "請先驗證您的電子郵件"));
    }

    const user = await User.findOne({ email }).select("+password");
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return next(appError(400, "您的密碼不正確"));
    }
    generateSendJWT(user, 200, res);
  },

  // 重設密碼
  updatePassword: async function (req, res, next) {
    const { password, confirmPassword } = req.body;

    // 密碼必須為英數混合且至少 8 碼
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return next(appError("400", "密碼必須為英數混合且至少 8 碼"));
    }

    if (password !== confirmPassword) {
      return next(appError("400", "密碼不一致！"));
    }
    let newPassword = await bcrypt.hash(password, 12);

    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword,
    });
    generateSendJWT(user, 200, res, "更改密碼成功");
  },

  // 管理員重設密碼
  adminUpdatePassword: async function (req, res, next) {
    const { adminPassword, userId, newPassword, confirmPassword } = req.body;

    // 這裡應該檢查管理員密碼是否正確
    // 這只是一個示例，實際上你應該從環境變量或配置文件中獲取管理員密碼
    const correctAdminPassword = process.env.ADMIN_PASSWORD;

    if (adminPassword !== correctAdminPassword) {
      return next(appError("401", "管理員密碼錯誤！"));
    }

    if (newPassword !== confirmPassword) {
      return next(appError("400", "密碼不一致！"));
    }

    let hashedPassword = await bcrypt.hash(newPassword, 12);

    const user = await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    if (!user) {
      return next(appError("404", "用戶不存在！"));
    }

    handleSuccess(res, null, "更改密碼成功");
  },

  // google 登入
  googleCallback: async function (req, res, next) {
    const user = await User.findById(req.user.id);
    generateSendJWT(user, 200, res);
    // 將用戶重定向回前端的主頁面
    // return res.redirect('http://localhost:3000/');
    // res.redirect('http://localhost:3000/');
  },
};
// http://localhost:3666/users/google/callback

module.exports = usersController;

/**
 * http://localhost:3666/users/google/callback?
 * code=4%2F0AeaYSHCc3ZDtGARS44knJP2jS9tyLKA50AGHtFdVY8MDorynJUROwiPSx2soKnaXNthF5w
 * &scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&authuser=1&prompt=consent
 */
