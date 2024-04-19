const express = require("express"); // 引入 Express 框架
const router = express.Router(); // 創建一個路由器實例
const mongoose = require('mongoose');
const tools = require('../utils/tools');
const headers = require("../utils/headers"); // 引入自訂的頭部工具
const handleError = require("../utils/handleError"); // 引入自訂的錯誤處理工具
const handleSuccess = require("../utils/handleSuccess"); // 引入自訂的成功處理工具
const User = require("../models/user"); // 引入 Post 模型

// 定義 GET 請求的路由，用於獲取所有資料
router.get("", async (req, res) => {
  try {
    const user = await User.find(); // 查詢所有資料
    handleSuccess(res, user, "取得所有資料成功"); // 如果成功，回應成功信息和資料
  } catch (err) {
    handleError(res, err.message); // 如果發生錯誤，回應錯誤信息
  }
});

// 獲取特定使用者
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      handleSuccess(res, user, "取得單筆資料成功");
    } else {
      handleError(res, "找不到該使用者資料");
    }
  } catch (e) {
    handleError(res, err.message); // 如果發生錯誤，回應錯誤信息
  }
});

// 定義 POST 請求的路由，用於新增單筆資料
router.post("", async (req, res) => {
  try {
    let data = req.body; // 獲取請求體中的數據
    data = tools.trimObjectAllValues(data);
    // console.log(req.body)

    if (data) {
      // 定義及檢查欄位內容不得為空
      const fieldsToCheck = ['name', 'email','password'];
      const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
      if (errorMessage) {
          handleError(res, errorMessage);
          return;
      }

      // 定義及提供的數據是否只包含了允許的欄位
      const allowedFields = ['name', 'email','password'];
      const invalidFieldsError = tools.validateFields(data, allowedFields);
      if (invalidFieldsError) {
          handleError(res, invalidFieldsError);
          return;
      }

      const newUser = await User.create({
        // 創建新的資料
        name: data.name,
        email: data.email,
        password: data.password
      });
      handleSuccess(res, newUser, "新增單筆資料成功"); // 如果成功，回應成功信息和新的資料
    } else {
      handleError(res); // 如果內容不存在，回應錯誤信息
    }
  } catch (err) {
    handleError(res, err.message); // 如果發生錯誤，回應錯誤信息
  }
});

// 定義 DELETE 請求的路由，用於刪除全部資料
router.delete("", async (req, res) => {
  try {
    const data = await User.deleteMany({}); // 刪除全部資料
    handleSuccess(res, [], "刪除全部資料成功"); // 如果成功，回應成功信息
  } catch (err) {
    handleError(res, err.message); // 如果發生錯誤，回應錯誤信息
  }
});

// 定義 DELETE 請求的路由，用於刪除單筆資料
router.delete("/:id", async (req, res) => {
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
});

// 定義 PATCH 請求的路由，用於更新單筆資料
router.patch("/:id", async (req, res) => {
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
      handleError(res, '資料未變更');
      return;
    }
    
    // 定義及檢查欄位內容不得為空
    const fieldsToCheck = ['name'];
    const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
    if (errorMessage) {
        handleError(res, errorMessage);
        return;
    }
    
    // 定義及提供的數據是否只包含了允許的欄位
    const allowedFields = ['name', 'gender', 'email', 'password', 'birthday'];
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
        birthday: data.birthday
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
});

module.exports = router; // 將路由器實例導出，以便於其他模組使用
