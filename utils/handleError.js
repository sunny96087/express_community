// const headers = require('./headers');

const handleError = (res, message) => {
    res.writeHead(400);
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