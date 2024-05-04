const express = require("express"); // 引入 Express 框架
const router = express.Router(); // 創建一個路由器實例
const handleErrorAsync = require("../utils/handleErrorAsync");

const usersController = require("../controllers/usersController");
const emailController = require("../controllers/emailController");
const { isAuth } = require("../utils/auth");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const passport = require("passport");

// 定義 GET 請求的路由，用於獲取所有資料
router.get(
  "/",
  // isAuth,
  handleErrorAsync(usersController.getUsers)
  /* 	
    #swagger.tags = ['Users']
    #swagger.description = '取得所有使用者資料' 
  */
);

// 獲取特定使用者
router.get(
  "/userOne",
  isAuth,
  handleErrorAsync(usersController.getUser)
  /*
    #swagger.tags = ['Users']
    #swagger.description = '取得指定 ID 使用者資料' 
  */
);

// 獲取特定使用者 公開資料
router.get(
  "/userOneOpen/:id",
  handleErrorAsync(usersController.getUserOpen)
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
  "/",
  isAuth,
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
                type: 'Number',
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
  isAuth,
  handleErrorAsync(usersController.followUser)
  /** 
    #swagger.tags = ['Users']
    #swagger.description = '追蹤或取消追蹤指定 ID 的用戶'
    */
);

// 取得指定使用者 ID 的追蹤清單
router.get(
  "/followList",
  isAuth,
  handleErrorAsync(usersController.getFollows)
  // #swagger.tags = ['Users']
  // #swagger.description = '取得指定使用者 ID 的追蹤清單'
);

// 註冊
router.post(
  "/sign_up",
  handleErrorAsync(usersController.signUp)
  /** 
    #swagger.tags = ['Users']
    #swagger.description = '註冊成為使用者'

    #swagger.parameters['user'] = {
        in: 'body',
        required: true,
        schema: {
            name: {
                type: 'string',
                description: '名稱',
                required: true
            },
            password: {
                type: 'string',
                description: '密碼',
                required: true
            },
            confirmPassword: {
                type: 'string',
                description: '再次確認密碼',
                required: true
            },
            email: {
                type: 'string',
                description: '電子郵件',
                required: true
            }
        }
    }
    */
);

// 註冊路由，包括電子郵件驗證
router.post(
  "/signup-with-email-verification",
  handleErrorAsync(usersController.signUpWithEmailVerification)
  /** 
    #swagger.tags = ['Users']
    #swagger.description = '註冊成為使用者 - 要驗證電子郵件'

    #swagger.parameters['user'] = {
        in: 'body',
        required: true,
        schema: {
            name: {
                type: 'string',
                description: '名稱',
                required: true
            },
            password: {
                type: 'string',
                description: '密碼',
                required: true
            },
            confirmPassword: {
                type: 'string',
                description: '再次確認密碼',
                required: true
            },
            email: {
                type: 'string',
                description: '電子郵件',
                required: true
            }
        }
    }
    */
);


// 確認 email 是否已註冊
router.get(
  "/checkEmail/:email",
  handleErrorAsync(usersController.checkEmail)
  // #swagger.tags = ['Users']
  // #swagger.description = '確認 email 是否已註冊'
);

// 登入
router.post(
  "/sign_in",
  handleErrorAsync(usersController.signIn)
  /** 
    #swagger.tags = ['Users']
    #swagger.description = '登入'

    #swagger.parameters['user'] = {
        in: 'body',
        required: true,
        schema: {
            email: {
                type: 'string',
                description: '帳號 (電子郵件)',
                required: true
            },
            password: {
                type: 'string',
                description: '密碼',
                required: true
            }
        }
    }
    */
);

// 重設密碼
router.post(
  "/updatePassword",
  isAuth,
  handleErrorAsync(usersController.updatePassword)
  /** 
    #swagger.tags = ['Users']
    #swagger.description = '重設密碼'

    #swagger.parameters['user'] = {
        in: 'body',
        required: true,
        schema: {
            password: {
                type: 'string',
                description: '密碼',
                required: true
            },
            confirmPassword: {
                type: 'string',
                description: '再次確認密碼',
                required: true
            },
        }
    }
    */
);

// 管理員重設密碼
router.post(
  "/adminUpdatePassword",
  handleErrorAsync(usersController.adminUpdatePassword)
  /** 
     #swagger.tags = ['Users']
     #swagger.description = '管理員重設密碼'
 
     #swagger.parameters['admin'] = {
         in: 'body',
         required: true,
         schema: {
             adminPassword: {
                 type: 'string',
                 description: '管理員密碼',
                 required: true
             },
             userId: {
                 type: 'string',
                 description: '用戶ID',
                 required: true
             },
             newPassword: {
                 type: 'string',
                 description: '新密碼',
                 required: true
             },
             confirmPassword: {
                 type: 'string',
                 description: '再次確認新密碼',
                 required: true
             },
         }
     }
     */
);

// google 登入
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
  // #swagger.tags = ['Users']
  // #swagger.description = 'google 登入'
);

// google 登入後回傳資料
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  handleErrorAsync(usersController.googleCallback)

  // #swagger.tags = ['Users']
  // #swagger.description = 'google 登入後回傳資料'
);

module.exports = router;
