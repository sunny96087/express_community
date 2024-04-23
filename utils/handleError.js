// const headers = require('./headers');
const cors = require('cors');

// 允許所有的源
app.use(cors());

const handleError = (res, message) => {
    res.writeHead(400,headers);
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