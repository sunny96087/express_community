const mongoose = require('mongoose');
const handleError = require('./handleError');

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
    const invalidFields = Object.keys(data).filter(key => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        return `不允許的欄位: ${invalidFields.join(', ')}`;
    }
    return null;
}

// 檢查 ID 格式及是否存在
async function findModelById(Model, id, res) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        handleError(res, 'ID 格式不正確');
        return null;
    }
    
    const model = await Model.findById(id);
    if (!model) {
        handleError(res, 'ID 不存在');
        return null;
    }

    return model;
}

// 遍歷物件中的每個 key，如果值是字串，使用 trim 方法去掉前後的空格
function trimObjectValues(obj) {
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key].trim();
        }
    }
    return obj;
}

// 將字串中所有的空格（包括空格、換行、Tab等）替換為空字符串
function trimObjectAllValues(obj) {
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            // 使用 replace 方法來去掉字串值中間的空格
            obj[key] = obj[key].replace(/\s+/g, '');
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
}