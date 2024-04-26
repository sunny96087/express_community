const appError = (httpStatus, errMessage, next) => {
    const error = new Error(errMessage);
    error.message = errMessage;
    error.statusCode = httpStatus;
    error.isOperational = true;
    return error;
}
// 錯誤會跑到 app.js 去顯示

module.exports = appError;