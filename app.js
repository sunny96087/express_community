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
var createError = require("http-errors"); // 引入 http-errors 模組，用於創建 HTTP 錯誤對象
var express = require("express"); // 引入 express 模組，用於創建 Express 應用程式
var path = require("path"); // 引入 path 模組，用於處理文件路徑
var cookieParser = require("cookie-parser"); // 引入 cookie-parser 中間件，用於解析 Cookie
var morgan = require("morgan"); // 引入 morgan 中間件，用於日誌記錄
var cors = require("cors"); // 引入允許跨網域套件 cors
const logger = require("./logger"); // 引入 logger.js => Winston 日誌
const deleteExpiredAccounts = require("./utils/cronJobs"); // 引入 cronJobs.js 定時任務

// swagger
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// ? 引入自訂元件
const handleError = require("./utils/handleError");
const handleSuccess = require("./utils/handleSuccess");
const appError = require("./utils/appError");

// 創建 Express 應用程式實例
var app = express();

// 程式出現重大錯誤時
process.on("uncaughtException", (err) => {
  // 記錄錯誤下來，等到服務都處理完後，停掉該 process
  console.error("Uncaughted Exception！");
  console.error(err);
  process.exit(1);
});

// ? 連接資料庫
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("資料庫連接成功"))
  .catch((err) => {
    console.log("MongoDB 連接失敗:", err);
  });

// 啟動定時任務
deleteExpiredAccounts();

// 引入自訂路由 routes
const postsRouter = require("./routes/posts");
var usersRouter = require("./routes/users");
const uploadRouter = require("./routes/upload");
const emailRouter = require("./routes/email");

// 預設首頁
var indexRouter = require("./routes/index");

// 測試用的 middleware
const myMiddleware = require("./middlewares/myMiddleware");
app.use(myMiddleware);

// 處理跨域問題
app.use(cors()); // 全部放行 危險！
// const corsOptions = {
//   origin: ["https://express-community.onrender.com", "https://localhost:3000", "https://localhost:3666"],
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
//   allowedHeaders: ["Content-Type", "Authorization"],
// };
// app.use(cors(corsOptions));

// swagger, path => /v1
app.use("/v1", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// 設定視圖引擎，並指定視圖文件的位置
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 使用 morgan 中間件進行日誌記錄
app.use(morgan("dev"));

// 使用 express.json() 和 express.urlencoded() 中間件來解析 JSON 和 URL 編碼的請求體
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 使用 cookie-parser 中間件來解析 Cookie
app.use(cookieParser());

// 使用 express.static() 中間件來提供靜態文件
app.use(express.static(path.join(__dirname, "public")));

// 掛載路由
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/upload", uploadRouter);
app.use("/email", emailRouter);

app.use((req, res, next) => {
  // 設置 CSP 頭部
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; worker-src blob:;"
  );
  next();
});

// 404 錯誤
app.use(function (req, res, next) {
  // 使用 Winston 日誌器記錄 404 錯誤
  logger.warn(`路由不存在: ${req.originalUrl}`);
  // 回應一個包含錯誤訊息的 JSON 對象
  res.status(404).json({
    status: "error",
    message: "無此路由資訊",
    path: req.originalUrl, // 提供更多的上下文信息
  });
});

// express 錯誤處理
// ? 自己設定的錯誤處理

// * 生產環境 錯誤處理
const resErrorProd = (err, res) => {
  // 檢查錯誤是否是 已定義的
  if (err.isOperational) {
    // 是已定義的，回應 錯誤訊息 & 狀態碼 JSON
    res.status(err.statusCode).json({
      message: err.message,
      statusCode: err.statusCode,
    });
  } else {
    // 不是 已定義的，使用 Winston 日誌器記錄錯誤
    logger.error("出現重大錯誤", { error: err });
    // 回應 通用錯誤訊息 JSON
    res.status(500).json({
      status: "error",
      message: "系統錯誤，請恰系統管理員",
    });
  }
};

// * 開發環境 錯誤處理
const resErrorDev = (err, res) => {
  // 回應 詳細錯誤訊息 JSON
  res.status(err.statusCode).json({
    message: err.message,
    statusCode: err.statusCode,
    isOperational: err.isOperational,
    stack: err.stack,
    // error: err, // 暫時不使用範例，這樣前端要多抓一層
  });
};

// * 錯誤處理
// 定義一個中間件來處理所有的錯誤
app.use(function (err, req, res, next) {
  // 確保錯誤有一個狀態碼，如果沒有，則設置為 500
  err.statusCode = err.statusCode || 500;
  // 是否為開發環境
  if (process.env.NODE_ENV === "dev") {
    // 是開發環境，使用開發環境 錯誤處理
    return resErrorDev(err, res);
  }

  // 是驗證錯誤 (mongoose error)
  if (err.name === "ValidationError") {
    err.message = "資料欄位未填寫正確，請重新輸入！"; // 驗證錯誤固定訊息
    err.isOperational = true; // 已定義的錯誤
    return resErrorProd(err, res); // 使用生產環境 錯誤處理
  }

  // 上述都不符合，使用生產環境 錯誤處理
  resErrorProd(err, res);
});

// 未捕捉到的 catch
process.on("unhandledRejection", (err, promise) => {
  console.error("未捕捉到的 rejection：", promise, "原因：", err);
});

// 導出給 ./bin/www 使用
module.exports = app;
