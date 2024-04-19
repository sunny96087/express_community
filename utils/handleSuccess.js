const headers = require('./headers');

function handleSuccess(res, data, message){
    res.writeHead(200,headers);
    res.write(JSON.stringify({
        "status": "success",
        "data": data,
        "message": message
    }));
    res.end();
}

module.exports = handleSuccess;