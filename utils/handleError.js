const headers = require('./headers');

const handleError = (res, message) => {
    res.writeHead(400,headers);
    // let message = '';
    // if (err) {
    //   message = err.message;
    // } else {
    //   message = "錯誤 請聯繫管理員";
    // }
    // res.write(JSON.stringify({
    //     "status": "false",
    //     message
    // }));
    res.write(JSON.stringify({
      "status": "false",
      "message": message || "sorry, server error..."
    }));
    console.log(`
    "status": "false",
    "message": ${JSON.stringify(message)}`
    );
    res.end();
}

module.exports = handleError;