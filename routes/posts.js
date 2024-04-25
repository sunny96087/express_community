const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const dayjs = require("dayjs");
const tools = require("../utils/tools");
const handleError = require("../utils/handleError");
const handleSuccess = require("../utils/handleSuccess");
const { Post, Comment } = require("../models/post");

// 取得所有文章跟留言
router.get("/", async (req, res) => {
  // #swagger.tags = ['Posts']
  // #swagger.description = '取得所有文章、留言、按讚列表，可帶排序 & 關鍵字搜尋'

  const { sort, keyword } = req.query;

  //   console.log(sort, keyword);

  try {
    // 建立查詢條件
    let query = {};
    if (keyword) {
      // 使用正則表達式進行模糊查詢
      // 'i' 選項表示不區分大小寫
      // query.$or = [
      //   { content: { $regex: keyword, $options: "i" } },
      //   { name: { $regex: keyword, $options: "i" } },
      // ];
      query = { content: { $regex: keyword, $options: "i" } };
    }

    // 建立查詢選項
    let options = {
      populate: [
        {
          path: "userId", // 連接的欄位
          select: "name avatar", // 只要這些欄位
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
    const formattedPosts = posts.map(post => {
      const postObject = post.toObject(); // 將 Mongoose 文檔轉為 JavaScript 對象
      return {
        ...postObject,
        createdAt: dayjs(post.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        comments: postObject.comments.map(comment => {
          return {
            ...comment,
            createdAt: dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm:ss')
          };
        })
      };
    });

    if (formattedPosts.length === 0) {
      return handleSuccess(res, formattedPosts, "沒有相關文章，建議換個關鍵字查詢");
    }

    handleSuccess(res, formattedPosts, "取得所有資料成功");
  } catch (err) {
    handleError(res, err.message);
  }
});

// 新增一筆文章
router.post("/", async (req, res) => {
  // #swagger.tags = ['Posts']
  // #swagger.description = '新增一篇文章'
  try {
    const data = req.body;
    if (data) {
      // 定義及檢查欄位內容不得為空
      const fieldsToCheck = ["name", "content"];
      const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
      if (errorMessage) {
        handleError(res, errorMessage);
        return;
      }

      // 定義及提供的數據是否只包含了允許的欄位
      const allowedFields = ["content", "image", "likes", "likedBy", "userId"];
      const invalidFieldsError = tools.validateFields(data, allowedFields);
      if (invalidFieldsError) {
        handleError(res, invalidFieldsError);
        return;
      }

      const newPost = await Post.create({
        content: data.content,
        image: data.image,
        likes: data.likes,
        likedBy: data.likedBy,
        userId: data.userId,
      });
      handleSuccess(res, newPost, "新增單筆資料成功");
    } else {
      handleError(res);
    }
  } catch (err) {
    handleError(res, err.message);
  }
});

// 刪除所有文章
router.delete("/", async (req, res) => {
  // #swagger.tags = ['Posts']
  // #swagger.description = '刪除全部的文章'
  try {
    const data = await Post.deleteMany({});
    handleSuccess(res, [], "刪除全部資料成功");
  } catch (err) {
    handleError(res, err.message);
  }
});

// 刪除單筆文章
router.delete("/:id", async (req, res) => {
  // #swagger.tags = ['Posts']
  // #swagger.description = '刪除指定 ID 的文章'
  try {
    const id = req.params.id;

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelById(Post, id, res);
    if (!isIdExist) {
      return;
    }

    await Post.findByIdAndDelete(id);
    handleSuccess(res, null, "刪除單筆資料成功");
  } catch (err) {
    handleError(res, err.message);
  }
});

// 修改單筆文章
router.patch("/:id", async (req, res) => {
  // #swagger.tags = ['Posts']
  // #swagger.description = '修改指定 ID 的文章'
  try {
    const id = req.params.id;
    let data = req.body;

    // 使用 trimObjectValues 函數來去掉資料中所有值的空格
    data = tools.trimObjectAllValues(data);

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelById(Post, id, res);
    if (!isIdExist) {
      // 如果 isIdExist 為 null，則已經處理過錯誤，直接返回
      return;
    }

    // 使用 hasDataChanged 函數來檢查資料是否有改變
    const oldData = await Post.findById(id);
    if (!tools.hasDataChanged(oldData, data)) {
      handleError(res, "資料未變更");
      return;
    }

    // 定義及檢查欄位內容不得為空
    const fieldsToCheck = ["content"];
    const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
    if (errorMessage) {
      handleError(res, errorMessage);
      return;
    }

    // 定義及提供的數據是否只包含了允許的欄位
    const allowedFields = ["content", "image", "likes", "likedBy"];
    const invalidFieldsError = tools.validateFields(data, allowedFields);
    if (invalidFieldsError) {
      handleError(res, invalidFieldsError);
      return;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        // name: data.name,
        content: data.content,
        image: data.image,
        likes: data.likes,
        likedBy: data.likedBy,
        userId: data.userId,
      },
      { new: true } // 返回更新後的 updatedPost
    );

    if (updatedPost) {
      handleSuccess(res, updatedPost, "更新單筆資料成功");
    } else {
      handleError(res);
    }
  } catch (err) {
    handleError(res, err.message);
  }
});

// 文章按讚
router.patch("/like/:id", async (req, res) => {
  // #swagger.tags = ['Posts']
  // #swagger.description = '對指定 ID 的文章按讚'

  const { id } = req.params;
  const userId = req.body.userId; // body 取得用戶 ID

  try {
    const post = await Post.findById(id);
    if (!post) {
      return handleError(res, "文章不存在");
    }

    let message; // 用來存儲返回的訊息
    const index = post.likedBy.indexOf(userId);

    if (index !== -1) {
      // 如果已經點過讚，移除用戶 ID 並減少點讚數
      post.likedBy.splice(index, 1);
      post.likes = Math.max(0, post.likes - 1); // 確保 likes 不會小於 0
      message = "取消點讚";
    } else {
      // 如果未點過讚，添加用戶 ID 並增加點讚數
      post.likedBy.push(userId);
      post.likes += 1;
      message = "成功點讚";
    }

    await post.save();
    handleSuccess(res, post, message); // 返回不同的成功訊息
  } catch (err) {
    handleError(res, err.message);
  }
});

// 新增單筆留言
router.post("/comments/:postId", async (req, res) => {
  const { postId } = req.params; // 獲得文章 ID
  const { content, userId } = req.body; // 獲得留言內容和用戶 ID

  if (!content || !userId) {
    return handleError(res, "留言內容和用戶 ID 是必填項");
  }

  try {
    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelById(Post, postId, res);
    if (!isIdExist) {
      return;
    }

    // 檢查文章是否存在
    const postExists = await Post.findById(postId);
    if (!postExists) {
      return handleError(res, "文章不存在。");
    }

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
  } catch (err) {
    handleError(res, err.message);
  }
});

// 刪除留言
router.delete("/comments/:commentId", async (req, res) => {
  const { commentId } = req.params; // 獲得留言 ID

  try {
    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelById(Comment, commentId, res);
    if (!isIdExist) {
      return;
    }

    // 查找並刪除留言
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return handleError(res, "留言不存在。");
    }

    // 從相應文章中移除留言引用
    await Post.updateOne(
      { _id: deletedComment.postId },
      { $pull: { comments: deletedComment._id } }
    );

    handleSuccess(res, { id: deletedComment._id }, "留言刪除成功");
  } catch (err) {
    handleError(res, err.message);
  }
});

module.exports = router;
