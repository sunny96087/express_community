const express = require("express"); // 引入 Express 框架
const dayjs = require("dayjs");
const tools = require("../utils/tools");
const appError = require("../utils/appError");
const handleSuccess = require("../utils/handleSuccess"); // 引入自訂的成功處理工具
const User = require("../models/user"); // 引入 Post 模型
const { Post, Comment } = require("../models/post");

const usersController = {
  // 取得全部使用者
  getUsers: async function (req, res, next) {
    /**
     * @swagger
     * /users:
     *   get:
     *     summary: '取得所有使用者'
     *     tags: ['Users']
     */
        /* 	
        #swagger.tags = ['Users']
        #swagger.description = '取得所有使用者' 
        */

    const user = await User.find(); // 查詢所有資料
    handleSuccess(res, user, "取得所有資料成功");
  },

  // 獲取特定使用者
  getUser: async function (req, res, next) {

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(User, req.params.id, next);
    if (!isIdExist) {
      return;
    }

    const user = await User.findById(req.params.id).select(
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

    const data = await User.deleteMany({}); // 刪除全部資料
    handleSuccess(res, [], "刪除全部資料成功");
  },

  // 刪除指定 ID 使用者資料
  deleteUser: async function (req, res, next) {

    const id = req.params.id;

    const isIdExist = await tools.findModelByIdNext(User, id, next);
    if (!isIdExist) {
      return;
    }

    await User.findByIdAndDelete(id); // 刪除指定 ID 的資料

    handleSuccess(res, null, "刪除單筆資料成功");
  },

  // 修改指定 ID 使用者資料
  updateUser: async function (req, res, next) {

    const id = req.params.id;
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
    const allowedFields = ["name", "gender", "email", "password", "birthday", "avatar"];
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
       }
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
    const userId = req.body.userId; // 獲取當前用戶ID

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
      handleSuccess(res, null, "取消追蹤成功");
    } else {
      // 如果尚未追蹤，則追蹤
      await User.updateOne(
        { _id: userId },
        { $push: { following: { userId: id, createdAt: new Date() } } }
      );
      handleSuccess(res, null, "追蹤成功");
    }
  },

  // 取得指定使用者 ID 的追蹤清單
  getFollows: async function (req, res, next) {

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
            },
          };
        })
        .filter((follow) => follow !== null), // 移除所有 null 的 follow
    };

    handleSuccess(res, formattedUser, "取得單筆資料成功");
  },
};

module.exports = usersController;
