// const headers = require('./headers');


function handleSuccess(res, data, message){

    res.status(200).json({
        status: "success",
        data: data,
        message: message
    })
    /**
    res.writeHead(200);
    res.write(JSON.stringify({
        "status": "success",
        "data": data,
        "message": message
    }));
    res.end(); */
}

module.exports = handleSuccess;