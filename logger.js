// logger.js

// 引入 winston 模組，這是一個強大的日誌庫
const winston = require('winston');

// 使用 winston 的 createLogger 方法創建一個日誌實例
const logger = winston.createLogger({
 // 設置日誌的級別，這裡設置為 'info'，表示只記錄級別為 'info' 或更高級別的日誌
 level: 'info',
 // 設置日誌的格式，這裡使用 json 格式
 format: winston.format.json(),
 // 設置日誌的默認元數據，這裡設置了一個 service 欄位，值為 'user-service'
 defaultMeta: { service: 'user-service' },
 // 設置日誌的輸出目標，這裡設置了兩個輸出目標：一個是文件，一個是控制台
 transports: [
    // 將日誌訊息輸出到 'error.log' 文件中，並且只記錄級別為 'error' 的日誌
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // 將日誌訊息輸出到控制台
    new winston.transports.Console()
 ],
});

// 將創建的日誌實例導出，以便在其他文件中使用
module.exports = logger;