const swaggerAutogen = require('swagger-autogen')();
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const doc = {
    info: {
        version: "1.0.0",
        title: "社群平台 API",
        description: "六角課程主線任務練習用 api"
    },
    // * 開發
    // host: 'localhost:3666',
    // schemes: ['http', 'https'],
    // * 部署
    host: "express-community.onrender.com",
    schemes: ['https'],

    basePath: "/",
    tags: [ // by default: empty Array
      {
        name: "Index",
        description: "首頁"
      },
      {
        name: "Users",
        description: "使用者"
      },
      {
        name: "Posts",
        description: "文章"
      },
      {
        name: "Upload",
        description: "上傳圖片"
      },
      {
        name: "Email",
        description: "信箱驗證"
      },
      {
        name: "Announcements",
        description: "公告"
      },
    ],
}

const outputFile = './swagger_output.json'; // 輸出的文件名稱
const endpointsFiles = ['./app.js',
'./controllers/usersController.js',
'./controllers/postsController.js',
'./controllers/uploadController.js',
'./controllers/emailController.js',
'./controllers/announcementController.js']; // 要指向的 API，通常使用 Express 直接指向到 app.js 就可以

swaggerAutogen(outputFile, endpointsFiles, doc); // swaggerAutogen 的方法

// Demo
// http://localhost:3666/v1
// https://express-community.onrender.com/v1