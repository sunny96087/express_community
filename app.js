/*
    主線任務頁面：
    - 登入
    - 註冊
    - 全體動態牆
    - 追蹤名單
    - 個人資料 ( 改密碼、改資料 )
    - 張貼動態
    - 我按讚的貼文
    - 個人牆
 */
// ? 套件引入
var createError = require('http-errors'); // 引入 http-errors 模組，用於創建 HTTP 錯誤對象
var express = require('express'); // 引入 express 模組，用於創建 Express 應用程式
var path = require('path');// 引入 path 模組，用於處理文件路徑
var cookieParser = require('cookie-parser'); // 引入 cookie-parser 中間件，用於解析 Cookie
var logger = require('morgan'); // 引入 morgan 中間件，用於日誌記錄
var cors = require('cors'); // 引入允許跨網域套件 cors

const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json') // 剛剛輸出的 JSON

const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// ? 引入自訂元件
const headers = require('./utils/headers');
const handleError = require('./utils/handleError');
const handleSuccess = require('./utils/handleSuccess');

// ? 連接資料庫
const DB = process.env.DATABASE.replace("<password>", process.env.DATABASE_PASSWORD);

mongoose
.connect(DB)
.then(() => console.log('資料庫連接成功'))
.catch((err) => {
    console.log(err);
});

// 引入自訂路由 routes
const postsRouter = require('./routes/posts');
var usersRouter = require('./routes/users');

// 引入路由模組
var indexRouter = require('./routes/index');


// 創建 Express 應用程式實例
var app = express();
app.use(cors());

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// 設定視圖引擎，並指定視圖文件的位置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 使用 morgan 中間件進行日誌記錄
app.use(logger('dev'));

// 使用 express.json() 和 express.urlencoded() 中間件來解析 JSON 和 URL 編碼的請求體
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 使用 cookie-parser 中間件來解析 Cookie
app.use(cookieParser());

// 使用 express.static() 中間件來提供靜態文件
app.use(express.static(path.join(__dirname, 'public')));

// 掛載路由
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);

// app.options('*', (req, res) => {
//   res.set(headers);
//   res.status(200).end();
// });

// 捕獲 404 錯誤並轉發到錯誤處理中間件
app.use(function(req, res, next) {
 next(createError(404));
});

// 錯誤處理中間件
app.use(function(err, req, res, next) {
 // 設置本地變量，只在開發環境中提供錯誤詳情
 res.locals.message = err.message;
 res.locals.error = req.app.get('env') === 'development' ? err : {};

 // 渲染錯誤頁面
 res.status(err.status || 500);
 res.render('error');
});

// 導出應用程式實例，以便在其他文件中使用
module.exports = app;