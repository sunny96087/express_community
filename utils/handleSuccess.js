// const headers = require('./headers');
const cors = require('cors');

// 允許所有的源
app.use(cors());

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