const express = require("express");
const dayjs = require("dayjs");
const tools = require("../utils/tools");
const appError = require("../utils/appError");
const handleSuccess = require("../utils/handleSuccess");
const { Post, Comment } = require("../models/post");
const User = require("../models/user");

const postsController = {
  // 取得所有文章跟留言
  getPosts: async (req, res, next) => {
    const { sort, keyword, userId } = req.query;
    // console.log(sort, keyword, userId);

    // 建立查詢條件
    let query = {};
    if (keyword) {
      // 對userId參考的User模型中的name進行模糊搜索
      // 注意：這裡假設你已經有一個User模型，並且你想要查詢的是與這個User模型中的name字段相關的貼文
      // 這需要你先找到匹配的User ID，然後使用這些ID來查詢Post
      const users = await User.find({
        name: { $regex: keyword, $options: "i" },
      });
      const userIds = users.map((user) => user._id);
      query = {
        $or: [
          { content: { $regex: keyword, $options: "i" } },
          { userId: { $in: userIds } },
        ],
      };
    }

    // 如果有提供 userId，則額外篩選出該使用者的文章
    if (userId) {
      // 檢查 ID 格式及是否存在
      const isIdExist = await tools.findModelByIdNext(User, userId, next);
      if (!isIdExist) {
        return;
      }
      query.userId = userId; // 添加 userId 到查詢條件中
    }

    // 建立查詢選項
    let options = {
      populate: [
        {
          path: "userId", // 連接的欄位
          select: "name avatar id", // 只要這些欄位
        },
        {
          path: "comments",
          populate: {
            path: "userId",
            select: "name avatar",
          },
        },
        {
          path: "likedBy",
          select: "name avatar",
        },
      ],
      sort: {},
    };

    // 設定排序
    if (sort === "oldest") {
      options.sort = { createdAt: 1 }; // 日期 從舊到新
    } else if (sort === "mostLiked") {
      options.sort = { likes: -1 }; // 讚數 從高到低
    } else {
      options.sort = { createdAt: -1 }; // 日期 從新到舊
    }

    // 執行查詢
    const posts = await Post.find(query, null, options);

    // 格式化日期
    const formattedPosts = posts.map((post) => {
      const postObject = post.toObject(); // 將 Mongoose 文檔轉為 JavaScript 對象
      return {
        ...postObject,
        createdAt: dayjs(post.createdAt).format("YYYY-MM-DD HH:mm:ss"),
        comments: postObject.comments.map((comment) => {
          return {
            ...comment,
            createdAt: dayjs(comment.createdAt).format("YYYY-MM-DD HH:mm:ss"),
          };
        }),
      };
    });

    if (formattedPosts.length === 0) {
      return handleSuccess(
        res,
        formattedPosts,
        "沒有相關文章，建議換個關鍵字查詢"
      );
    }

    handleSuccess(res, formattedPosts, "取得所有資料成功");
  },

  // 新增一筆文章
  createPost: async (req, res, next) => {
    // 直接從 token 拿 id
    const id = req.user.id;
    const data = req.body;

    if (data) {
      // 定義及檢查欄位內容不得為空
      const fieldsToCheck = ["content"];
      const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
      if (errorMessage) {
        // handleError(res, errorMessage);
        // return;
        return next(appError(400, errorMessage));
      }

      // 檢查 ID 格式及是否存在
      const isIdExist = await tools.findModelByIdNext(User, id, next);
      if (!isIdExist) {
        return;
      }

      // 定義及提供的數據是否只包含了允許的欄位
      const allowedFields = ["content", "image", "likes", "likedBy"];
      const invalidFieldsError = tools.validateFields(data, allowedFields);
      if (invalidFieldsError) {
        return next(appError(400, invalidFieldsError));
      }

      const newPost = await Post.create({
        content: data.content,
        image: data.image,
        likes: data.likes,
        likedBy: data.likedBy,
        userId: id,
      });
      handleSuccess(res, newPost, "新增單筆資料成功");
    } else {
      return next(appError(400, "新增單筆資料失敗"));
    }
  },

  // 刪除所有文章
  deleteAllPosts: async (req, res, next) => {
    // 刪除所有文章
    const data = await Post.deleteMany({});

    // 從所有用戶的 likedPosts 列表中移除所有文章的 ID
    // 這裡假設所有文章的 ID 都已經被刪除，所以我們可以直接清空 likedPosts 列表
    await User.updateMany(
      {}, // 空的查詢條件表示更新所有文檔
      { $set: { likedPosts: [] } } // 將 likedPosts 設置為空陣列
    );
    handleSuccess(res, [], "刪除全部文章成功，用戶按讚紀錄也一併移除");
  },

  // 刪除單筆文章
  deletePost: async (req, res, next) => {
    const id = req.params.id;

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(Post, id, next);
    if (!isIdExist) {
      return;
    }

    // 從所有相關用戶的 likedPosts 列表中移除這篇文章的 ID
    await User.updateMany(
      { likedPosts: { $elemMatch: { $eq: id } } },
      { $pull: { likedPosts: id } }
    );

    await Post.findByIdAndDelete(id);
    handleSuccess(res, null, "刪除單筆資料成功");
  },

  // 修改單筆文章
  updatePost: async (req, res, next) => {
    const id = req.params.id;
    let data = req.body;

    // 使用 trimObjectValues 函數來去掉資料中所有值的空格
    data = tools.trimObjectAllValues(data);

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(Post, id, next);
    if (!isIdExist) {
      // 如果 isIdExist 為 null，則已經處理過錯誤，直接返回
      return;
    }

    // 使用 hasDataChanged 函數來檢查資料是否有改變
    const oldData = await Post.findById(id);
    if (!tools.hasDataChanged(oldData, data)) {
      return next(appError(400, "資料未變更"));
    }

    // 定義及檢查欄位內容不得為空
    const fieldsToCheck = ["content"];
    const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
    if (errorMessage) {
      return next(appError(400, errorMessage));
    }

    // 定義及提供的數據是否只包含了允許的欄位
    const allowedFields = ["content", "image", "likes", "likedBy"];
    const invalidFieldsError = tools.validateFields(data, allowedFields);
    if (invalidFieldsError) {
      return next(appError(400, invalidFieldsError));
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        content: data.content,
        image: data.image,
        likes: data.likes,
        likedBy: data.likedBy,
        // userId: data.userId,
      },
      { new: true } // 返回更新後的 updatedPost
    );

    if (updatedPost) {
      handleSuccess(res, updatedPost, "更新單筆資料成功");
    } else {
      return next(appError(400, "更新單筆資料失敗"));
    }
  },

  // 文章按讚
  likePost: async (req, res, next) => {
    const { id } = req.params;
    const userId = req.body.userId; // body 取得用戶 ID
    if (!userId || userId.trim() === "") {
      return next(appError(400, "userId 不能為空"));
    }

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(Post, id, next);
    if (!isIdExist) {
      // 如果 isIdExist 為 null，則已經處理過錯誤，直接返回
      return;
    }

    // 檢查 ID 格式及是否存在
    const isUserIdExist = await tools.findModelByIdNext(User, userId, next);
    if (!isUserIdExist) {
      // 如果 isIdExist 為 null，則已經處理過錯誤，直接返回
      return;
    }

    const post = await Post.findById(id);

    let message; // 用來存儲返回的訊息
    const index = post.likedBy.indexOf(userId);

    if (index !== -1) {
      // 如果已經點過讚，移除用戶 ID 並減少點讚數
      post.likedBy.splice(index, 1);
      post.likes = Math.max(0, post.likes - 1); // 確保 likes 不會小於 0
      message = "取消點讚";
      // 從用戶的 likedPosts 中移除文章 ID
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: id } });
    } else {
      // 如果未點過讚，添加用戶 ID 並增加點讚數
      post.likedBy.push(userId);
      post.likes += 1;
      message = "成功點讚";
      // 將文章 ID 添加到用戶的 likedPosts 中
      await User.updateOne({ _id: userId }, { $push: { likedPosts: id } });
    }

    await post.save();
    handleSuccess(res, post, message);
  },

  // 新增單筆留言
  createComment: async (req, res, next) => {
    const { postId } = req.params; // 獲得文章 ID
    const { content, userId } = req.body; // 獲得留言內容和用戶 ID

    if (!content || !userId) {
      return next(appError(400, "留言內容和用戶 ID 是必填項"));
    }

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(Post, postId, next);
    if (!isIdExist) {
      return;
    }

    // 檢查 ID 格式及是否存在
    const isUserIdExist = await tools.findModelByIdNext(User, userId, next);
    if (!isUserIdExist) {
      return;
    }

    // 取得文章文檔
    const postExists = await Post.findById(postId);

    // 創建新的留言
    const newComment = new Comment({
      content,
      userId,
      postId: postId, // 使用 postId 作為參考
    });
    await newComment.save();

    // 將留言添加到文章的留言列表中
    postExists.comments.push(newComment._id);
    await postExists.save();

    handleSuccess(res, newComment, "留言新增成功");
  },

  // 刪除留言
  deleteComment: async (req, res, next) => {
    const { commentId } = req.params; // 獲得留言 ID

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(Comment, commentId, next);
    if (!isIdExist) {
      return;
    }

    // 查找並刪除留言
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return next(appError(400, "留言不存在。"));
    }

    // 從相應文章中移除留言引用
    await Post.updateOne(
      { _id: deletedComment.postId },
      { $pull: { comments: deletedComment._id } }
    );

    handleSuccess(res, { id: deletedComment._id }, "留言刪除成功");
  },
};

module.exports = postsController;
