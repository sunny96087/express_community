const express = require("express"); // 引入 Express 框架
const router = express.Router(); // 創建一個路由器實例
const handleErrorAsync = require("../utils/handleErrorAsync");

const usersController = require("../controllers/usersController");

// 定義 GET 請求的路由，用於獲取所有資料
router.get("/", handleErrorAsync(usersController.getUsers));

// 獲取特定使用者
router.get("/:id", handleErrorAsync(usersController.getUser));

// 定義 POST 請求的路由，用於新增單筆資料
router.post("/", handleErrorAsync(usersController.createUser));

// 定義 DELETE 請求的路由，用於刪除全部資料
router.delete("/", handleErrorAsync(usersController.deleteAllUsers));

// 定義 DELETE 請求的路由，用於刪除單筆資料
router.delete("/:id", handleErrorAsync(usersController.deleteUser));

// 定義 PATCH 請求的路由，用於更新單筆資料
router.patch("/:id", handleErrorAsync(usersController.updateUser));

// 取得指定 ID 的使用者按讚文章資料
router.get("/likedPosts/:id", handleErrorAsync(usersController.getLikedPosts));

// 追蹤或取消追蹤用戶
router.patch("/follow/:id", handleErrorAsync(usersController.followUser));

// 取得指定使用者 ID 的追蹤清單
router.get("/followList/:id", handleErrorAsync(usersController.getFollows));

module.exports = router;
