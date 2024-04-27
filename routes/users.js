const express = require("express"); // 引入 Express 框架
const router = express.Router(); // 創建一個路由器實例
const handleErrorAsync = require("../utils/handleErrorAsync");

const usersController = require("../controllers/usersController");

// 定義 GET 請求的路由，用於獲取所有資料
router.get(
  "/",
  handleErrorAsync(usersController.getUsers)
  /* 	
    #swagger.tags = ['Users']
    #swagger.description = '取得所有使用者資料' 
  */
);

// 獲取特定使用者
router.get(
  "/:id",
  handleErrorAsync(usersController.getUser)
  /*
    #swagger.tags = ['Users']
    #swagger.description = '取得指定 ID 使用者資料' 
  */
);

// 新增一位使用者
router.post(
  "/",
  handleErrorAsync(usersController.createUser)
  /** 
    #swagger.tags = ['Users']
    #swagger.description = '新增一位使用者'

    #swagger.parameters['user'] = {
        in: 'body',
        required: true,
        schema: {
            name: {
                type: 'string',
                description: '用戶名稱',
                required: true
            },
            email: {
                type: 'string',
                description: '用戶電子郵件',
                required: true
            },
            password: {
                type: 'string',
                description: '用戶密碼',
                required: true
            }
        }
    }
    */
);

// 刪除全部使用者資料
router.delete(
  "/",
  handleErrorAsync(usersController.deleteAllUsers)
  // #swagger.tags = ['Users']
  // #swagger.description = '刪除所有使用者資料'
);

// 刪除指定 ID 使用者資料
router.delete(
  "/:id",
  handleErrorAsync(usersController.deleteUser)
  // #swagger.tags = ['Users']
  // #swagger.description = '刪除指定 ID 使用者資料'
);

// 修改指定 ID 使用者資料
router.patch(
  "/:id",
  handleErrorAsync(usersController.updateUser)
  /** 
    #swagger.tags = ['Users']
    #swagger.description = '修改指定 ID 使用者資料'

    #swagger.parameters['user'] = {
        in: 'body',
        required: true,
        schema: {
            name: {
                type: 'string',
                description: '名稱',
                required: true
            },
            gender: {
                type: 'string',
                description: '性別 (1:male, 2:female, 3:other)',
            },
            password: {
                type: 'string',
                description: '密碼',
            },
            birthday: {
                type: 'string',
                description: '生日',
            },
            avatar: {
                type: 'string',
                description: '頭像',
            }
        }
    }
    */
);

// 取得指定 ID 的使用者按讚文章資料
router.get(
  "/likedPosts/:id",
  handleErrorAsync(usersController.getLikedPosts)
  /* 
    #swagger.tags = ['Users']
    #swagger.description = '取得指定 ID 的使用者按讚文章資料'
    */
);

// 追蹤或取消追蹤用戶
router.patch(
  "/follow/:id",
  handleErrorAsync(usersController.followUser)
  /** 
    #swagger.tags = ['Users']
    #swagger.description = '追蹤或取消追蹤指定 ID 的用戶'

    #swagger.parameters['user'] = {
        in: 'body',
        required: true,
        schema: {
            userId: {
                type: 'string',
                description: '當前用戶ID',
                required: true
            }
        }
    }
    */
);

// 取得指定使用者 ID 的追蹤清單
router.get(
  "/followList/:id",
  handleErrorAsync(usersController.getFollows)
  // #swagger.tags = ['Users']
  // #swagger.description = '取得指定使用者 ID 的追蹤清單'
);

module.exports = router;
