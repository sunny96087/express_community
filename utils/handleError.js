const headers = require('./headers');

const handleError = (res, err) => {
    res.writeHead(400,headers);
    let message = '';
    if (err) {
      message = err.message;
    } else {
      message = "錯誤 請聯繫管理員";
    }
    res.write(JSON.stringify({
        "status": "false",
        message
    }));
    res.end();
}

module.exports = handleError;