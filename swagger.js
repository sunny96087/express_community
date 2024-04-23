const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        version: "1.0.0",
        title: "社群平台 API",
        description: "六角課程主線任務練習用 api"
    },
    host: "express-community.onrender.com",
    basePath: "/v1",
    schemes: ['https'], // 確保使用 https 協議
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
    ],
}

const outputFile = './swagger_output.json'; // 輸出的文件名稱
const endpointsFiles = ['./app.js']; // 要指向的 API，通常使用 Express 直接指向到 app.js 就可以

swaggerAutogen(outputFile, endpointsFiles, doc); // swaggerAutogen 的方法