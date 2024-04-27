const express = require("express");
const router = express.Router();
const handleErrorAsync = require("../utils/handleErrorAsync");

const postsController = require("../controllers/postsController");
const { isAuth } = require("../utils/auth");

// 取得所有文章跟留言
router.get(
  "/",
  handleErrorAsync(postsController.getPosts)
  /* 	
    #swagger.tags = ['Posts']
    #swagger.description = '取得所有文章、留言、按讚列表，可帶排序 & 關鍵字 & userId 搜尋'

    #swagger.parameters['sort'] = { in: 'query', description: '排序方式：預設最新, oldest（最舊）、mostLiked（最多讚）', type: 'string', default: 'newest' }
    #swagger.parameters['keyword'] = { in: 'query', description: '關鍵字，用於文章內容和用戶名稱的模糊搜索', type: 'string' }
    #swagger.parameters['userId'] = { in: 'query', description: '用戶ID，用於篩選特定用戶的文章', type: 'string' }
  */
);

// 新增一筆文章
router.post(
  "/",
  isAuth,
  handleErrorAsync(postsController.createPost)
  /** 
    #swagger.tags = ['Posts']
    #swagger.description = '新增一篇文章'

    #swagger.parameters['user'] = {
        in: 'body',
        required: true,
        schema: {
            content: {
                type: 'string',
                description: '文章內容',
                required: true
            },
            image: {
                type: 'string',
                description: '文章圖片',
            }
        }
    }
    */
);

// 刪除所有文章
router.delete(
  "/",
  handleErrorAsync(postsController.deleteAllPosts)
  // #swagger.tags = ['Posts']
  // #swagger.description = '刪除全部的文章'
);

// 刪除單筆文章
router.delete(
  "/:id",
  handleErrorAsync(postsController.deletePost)
  // #swagger.tags = ['Posts']
  // #swagger.description = '刪除指定 ID 的文章'
);

// 修改單筆文章 要加上 isAuth
router.patch(
  "/:id",
  handleErrorAsync(postsController.updatePost)
  /** 
    #swagger.tags = ['Posts']
    #swagger.description = '修改指定 ID 的文章'

    #swagger.parameters['user'] = {
        in: 'body',
        required: true,
        schema: {
            content: {
                type: 'string',
                description: '文章內容',
                required: true
            },
            image: {
                type: 'string',
                description: '文章圖片',
            }
        }
    }
    */
);

// todo
// 文章按讚
router.patch(
  "/like/:id",
  handleErrorAsync(postsController.likePost)
  /** 
    #swagger.tags = ['Posts']
    #swagger.description = '對指定 ID 的文章按讚'

    #swagger.parameters['user'] = {
        in: 'body',
        required: true,
        schema: {
            userId: {
                type: 'string',
                description: '用戶 ID',
                required: true
            }
        }
    }
    */
);

// 新增單筆留言
router.post(
  "/comments/:postId",
  handleErrorAsync(postsController.createComment)
  /** 
    #swagger.tags = ['Posts']
    #swagger.description = '新增指定 ID 的文章留言'

    #swagger.parameters['user'] = {
        in: 'body',
        required: true,
        schema: {
            userId: {
                type: 'string',
                description: '用戶 ID',
                required: true
            },
            content: {
                type: 'string',
                description: '留言內容',
                required: true
            }
        }
    }
    */
);

// 刪除留言
router.delete(
  "/comments/:commentId",
  handleErrorAsync(postsController.deleteComment)
  // #swagger.tags = ['Posts']
  // #swagger.description = '刪除指定 ID 的文章留言'
);

module.exports = router;
