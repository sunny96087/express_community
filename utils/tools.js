const mongoose = require("mongoose");
const handleError = require("./handleError");
const appError = require("../utils/appError");

// 檢查欄位內容不得為空
function checkFieldsNotEmpty(data, fields) {
  for (const field of fields) {
    if (data[field] && data[field].trim().length === 0) {
      return `欄位 ${field} 不能為空`;
    }
  }
  return null; // 如果所有欄位都不為空，則返回 null
}

// 檢查提供的數據是否只包含了允許的欄位
function validateFields(data, allowedFields) {
  const invalidFields = Object.keys(data).filter(
    (key) => !allowedFields.includes(key)
  );
  if (invalidFields.length > 0) {
    return `不允許的欄位: ${invalidFields.join(", ")}`;
  }
  return null;
}

// 檢查數據是否包含所有必填欄位
function checkRequiredFields(data, requiredFields) {
  const missingFields = requiredFields.filter(
    (field) => !data.hasOwnProperty(field) || !data[field]
  );
  if (missingFields.length > 0) {
    return { isValid: false, missingFields };
  }
  return { isValid: true };
}

// 檢查 ID 格式及是否存在
async function findModelById(Model, id, res) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    handleError(res, "ID 格式不正確");
    return null;
  }

  const model = await Model.findById(id);
  if (!model) {
    handleError(res, "ID 不存在");
    return null;
  }

  return model;
}

/**
 * 按 ID 查找模型並驗證其存在性
 * @param {Mongoose.Model} Model - Mongoose 模型
 * @param {string} id - 要查找的文檔 ID
 * @param {Function} next - Express 的 next 函數，用於錯誤處理
 * @returns {Promise<Mongoose.Document|null>} 返回模型實例或在出錯時返回 null
 */
async function findModelByIdNext(Model, id, next) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(appError(400, "ID 格式不正確")); // 使用 next 處理格式錯誤
    return null;
  }

  try {
    const model = await Model.findById(id);
    if (!model) {
      next(appError(404, "ID 不存在")); // 使用 next 處理查找錯誤
      return null;
    }
    return model;
  } catch (error) {
    next(appError(500, "服務器錯誤")); // 捕捉並傳遞任何其他可能的錯誤
    return null;
  }
}

// 遍歷物件中的每個 key，如果值是字串，使用 trim 方法去掉前後的空格
function trimObjectValues(obj) {
  for (let key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].trim();
    }
  }
  return obj;
}

// 將字串中所有的空格（包括空格、換行、Tab等）替換為空字符串
function trimObjectAllValues(obj) {
  for (let key in obj) {
    if (typeof obj[key] === "string") {
      // 使用 replace 方法來去掉字串值中間的空格
      obj[key] = obj[key].replace(/\s+/g, "");
    }
  }
  return obj;
}

// 檢查拿到的資料跟資料庫的資料有沒有一樣
function hasDataChanged(originalData, newData) {
  for (let key in newData) {
    if (newData[key] !== originalData[key]) {
      return true;
    }
  }
  return false;
}

module.exports = {
  checkFieldsNotEmpty,
  validateFields,
  findModelById,
  trimObjectValues,
  trimObjectAllValues,
  hasDataChanged,
  findModelByIdNext,
  checkRequiredFields,
};
