// const headers = require('./headers');
// const cors = require('cors');


function handleSuccess(res, data, message){
    res.writeHead(200);
    res.write(JSON.stringify({
        "status": "success",
        "data": data,
        "message": message
    }));
    res.end();
}

module.exports = handleSuccess;