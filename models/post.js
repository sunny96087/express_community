const mongoose = require('mongoose');

// 定義一個操控特定 collection 的 modal => const ___ = new mongoose.Schema({ 定義欄位限制 });
const postSchema = new mongoose.Schema(
    {
      content: {
        type: String,
        required: [true, 'Content 未填寫'] // 設定必填 true, 後面帶上錯誤訊息
      },
      image: {
        type:String,
        default:""
      },
      createdAt: {
        type: Date,
        default: Date.now(),
        select: false  // 搜尋時不顯示
      },
      name: {
          type: String,
          required: [true, '貼文姓名未填寫']
      },
      likes: {
          type:Number,
          default:0
        }
    },
    {
      versionKey: false // 禁用 __v 欄位
    }
);

//                          集合名稱 單數 讓他自己加 s
const Post = mongoose.model('Post', postSchema);

// 導出
module.exports = Post;