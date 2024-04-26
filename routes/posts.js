const express = require("express");
const router = express.Router();

const postsController = require("../controllers/postsController");

// 取得所有文章跟留言
router.get("/", postsController.getPosts);
// 新增一筆文章
router.post("/", postsController.createPost);
// 刪除所有文章
router.delete("/", postsController.deleteAllPosts);
// 刪除單筆文章
router.delete("/:id", postsController.deletePost);
// 修改單筆文章
router.patch("/:id", postsController.updatePost);
// 文章按讚
router.patch("/like/:id", postsController.likePost);
// 新增單筆留言
router.post("/comments/:postId", postsController.createComment);
// 刪除留言
router.delete("/comments/:commentId", postsController.deleteComment);

module.exports = router;
