const express = require("express");
const router = express.Router();
const handleErrorAsync = require("../utils/handleErrorAsync");

const postsController = require("../controllers/postsController");

// 取得所有文章跟留言
router.get("/", handleErrorAsync(postsController.getPosts));
// 新增一筆文章
router.post("/", handleErrorAsync(postsController.createPost));
// 刪除所有文章
router.delete("/", handleErrorAsync(postsController.deleteAllPosts));
// 刪除單筆文章
router.delete("/:id", handleErrorAsync(postsController.deletePost));
// 修改單筆文章
router.patch("/:id", handleErrorAsync(postsController.updatePost));
// 文章按讚
// router.patch("/like/:id", postsController.likePost);
router.patch("/like/:id", handleErrorAsync(postsController.likePost));
// 新增單筆留言
router.post("/comments/:postId", handleErrorAsync(postsController.createComment));
// 刪除留言
router.delete("/comments/:commentId", handleErrorAsync(postsController.deleteComment));

module.exports = router;
