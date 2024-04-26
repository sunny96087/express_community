const express = require("express"); // 引入 Express 框架
const router = express.Router(); // 創建一個路由器實例
const mongoose = require("mongoose");
const dayjs = require("dayjs");
const tools = require("../utils/tools");
const headers = require("../utils/headers"); // 引入自訂的頭部工具
const handleError = require("../utils/handleError"); // 引入自訂的錯誤處理工具
const handleSuccess = require("../utils/handleSuccess"); // 引入自訂的成功處理工具
const User = require("../models/user"); // 引入 Post 模型

const usersController = {
  
  // 取得全部使用者
  getUsers: async function (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.description = '取得所有使用者'
    try {
      const user = await User.find(); // 查詢所有資料
      handleSuccess(res, user, "取得所有資料成功"); // 如果成功，回應成功信息和資料
    } catch (err) {
      handleError(res, err.message); // 如果發生錯誤，回應錯誤信息
    }
  },

  // 獲取特定使用者
  getUser: async function (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.description = '取得指定 ID 使用者'
    try {
      const user = await User.findById(req.params.id).select(
        "-createdAt -updatedAt -email "
      );
      if (user) {
        handleSuccess(res, user, "取得單筆資料成功");
      } else {
        handleError(res, "找不到該使用者資料");
      }
    } catch (e) {
      handleError(res, err.message); // 如果發生錯誤，回應錯誤信息
    }
  },

  // 定義 POST 請求的路由，用於新增單筆資料
  createUser: async function (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.description = '新增一位使用者'
    try {
      let data = req.body; // 獲取請求體中的數據
      data = tools.trimObjectAllValues(data);
      // console.log(req.body)

      if (data) {
        // 定義及檢查欄位內容不得為空
        const fieldsToCheck = ["name", "email", "password"];
        const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
        if (errorMessage) {
          handleError(res, errorMessage);
          return;
        }

        // 定義及提供的數據是否只包含了允許的欄位
        const allowedFields = ["name", "email", "password"];
        const invalidFieldsError = tools.validateFields(data, allowedFields);
        if (invalidFieldsError) {
          handleError(res, invalidFieldsError);
          return;
        }

        const newUser = await User.create({
          // 創建新的資料
          name: data.name,
          email: data.email,
          password: data.password,
        });
        handleSuccess(res, newUser, "新增單筆資料成功"); // 如果成功，回應成功信息和新的資料
      } else {
        handleError(res); // 如果內容不存在，回應錯誤信息
      }
    } catch (err) {
      handleError(res, err.message); // 如果發生錯誤，回應錯誤信息
    }
  },

  // 定義 DELETE 請求的路由，用於刪除全部資料
  deleteAllUsers: async function (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.description = '刪除所有使用者'
    try {
      const data = await User.deleteMany({}); // 刪除全部資料
      handleSuccess(res, [], "刪除全部資料成功"); // 如果成功，回應成功信息
    } catch (err) {
      handleError(res, err.message); // 如果發生錯誤，回應錯誤信息
    }
  },

  // 定義 DELETE 請求的路由，用於刪除單筆資料
  deleteUser: async function (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.description = '刪除指定 ID 使用者'
    try {
      const id = req.params.id; // 獲取路由參數中的 ID

      const isIdExist = await tools.findModelById(User, id, res);
      if (!isIdExist) {
        // 如果 isIdExist 為 null，則已經處理過錯誤，直接返回
        return;
      }

      await User.findByIdAndDelete(id); // 刪除指定 ID 的資料
      handleSuccess(res, null, "刪除單筆資料成功"); // 如果成功，回應成功信息
    } catch (err) {
      handleError(res, err.message); // 如果發生錯誤，回應錯誤信息
    }
  },

  // 定義 PATCH 請求的路由，用於更新單筆資料
  updateUser: async function (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.description = '修改指定 ID 使用者'
    try {
      const id = req.params.id; // 獲取路由參數中的 ID
      let data = req.body; // 獲取請求體中的數據

      // 使用 trimObjectValues 函數來去掉資料中所有值的空格
      data = tools.trimObjectAllValues(data);

      // 檢查 ID 格式及是否存在
      const isIdExist = await tools.findModelById(User, id, res);
      if (!isIdExist) {
        // 如果 isIdExist 為 null，則已經處理過錯誤，直接返回
        return;
      }

      // 使用 hasDataChanged 函數來檢查資料是否有改變
      const oldData = await User.findById(id);
      if (!tools.hasDataChanged(oldData, data)) {
        handleError(res, "資料未變更");
        return;
      }

      // 定義及檢查欄位內容不得為空
      const fieldsToCheck = ["name"];
      const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
      if (errorMessage) {
        handleError(res, errorMessage);
        return;
      }

      // 定義及提供的數據是否只包含了允許的欄位
      const allowedFields = ["name", "gender", "email", "password", "birthday"];
      const invalidFieldsError = tools.validateFields(data, allowedFields);
      if (invalidFieldsError) {
        handleError(res, invalidFieldsError);
        return;
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
        },
        { new: true }
      );

      if (updatedUser) {
        // 如果更新成功
        handleSuccess(res, updatedUser, "更新單筆資料成功"); // 回應成功信息和更新後的資料
      } else {
        handleError(res, "資料更新失敗"); // 如果更新失敗，回應錯誤信息
      }
    } catch (err) {
      handleError(res, err.message); // 如果發生錯誤，回應錯誤信息
    }
  },

  // 取得指定 ID 的使用者按讚文章資料

  getLikedPosts: async function (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.description = '取得指定 ID 的使用者按讚文章資料'
    try {
      const id = req.params.id; // 獲取路由參數中的 ID

      // 使用 populate 方法來取回按讚的文章列表
      // 並且在文章列表中的 userId 欄位取得對應的使用者名稱
      const user = await User.findById(id)
        .populate({
          path: "likedPosts", // 填充 likedPosts 欄位
          populate: {
            path: "userId", // 在 likedPosts 中的每個文檔填充 userId 欄位
            select: "name", // 只取得 name 欄位
          },
          select: "content image createdAt likes userId", // 只取得這些欄位
        })
        .select("-createdAt -updatedAt"); // 排除 User 模型本身的 createdAt 和 updatedAt 欄位;

      if (!user) {
        return handleError(res, "使用者不存在");
      }

      // 格式化日期
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
    } catch (err) {
      handleError(res, err.message);
    }
  },

  // 追蹤或取消追蹤用戶

  followUser: async function (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.description = '追蹤或取消追蹤指定 ID 的用戶'
    try {
      const { id } = req.params; // 獲取要追蹤或取消追蹤的用戶ID
      const userId = req.body.userId; // 獲取當前用戶ID

      // 檢查要追蹤或取消追蹤的用戶是否存在
      const userToFollow = await User.findById(id);
      if (!userToFollow) {
        return handleError(res, "要追蹤或取消追蹤的用戶不存在");
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
    } catch (err) {
      handleError(res, err.message);
    }
  },
  // 取得指定使用者 ID 的追蹤清單

  getFollows: async function (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.description = '取得指定使用者 ID 的追蹤清單'
    try {
      const id = req.params.id; // 獲取路由參數中的 ID

      // 使用 populate 方法來取回使用者資料及使用者追蹤清單
      // 並且在 following 欄位中的 userId 欄位取得對應的使用者名稱和頭像
      const user = await User.findById(id)
        .populate({
          path: "following.userId", // 填充 following.userId 欄位
          select: "name avatar", // 只取得 name 和 avatar 欄位
        })
        .select("-createdAt -updatedAt");

      if (!user) {
        return handleError(res, "使用者不存在");
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
    } catch (err) {
      handleError(res, err.message);
    }
  },
};

module.exports = usersController; // 將路由器實例導出，以便於其他模組使用
