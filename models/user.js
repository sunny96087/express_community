const mongoose = require('mongoose');

// 定義使用者模型
const userSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, '使用者名稱未填寫'] // 設定必填 true, 後面帶上錯誤訊息
      },
      gender: {
        type: String,
        enum: ['男', '女', '秘密'], // 限制性別選項
        default: null
      },
      email: {
        type: String,
        required: [true, '信箱未填寫'],
        unique: true // 確保信箱是唯一的
      },
      password: {
        type: String,
        required: [true, '密碼未填寫']
      },
      birthday: {
        type: Date,
        default:''
      }
    },
    {
      versionKey: false, // 禁用 __v 欄位
      timestamps: true // 自動添加 createdAt 和 updatedAt 欄位
    }
);

// 創建使用者模型
const User = mongoose.model('User', userSchema);

// 導出
module.exports = User;
