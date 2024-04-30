// utils / handleError.js

const handleError = (res, message) => {

  res.status(400).json({
    status: "false",
    message: message || "Sorry, server error..."
  }); 
  /** 
    res.writeHead(400);
    res.write(JSON.stringify({
      "status": "false",
      "message": message || "sorry, server error..."
    }));
    console.log(`
    "status": "false",
    "message": ${JSON.stringify(message)}`
    );
    res.end();*/
}

module.exports = handleError;