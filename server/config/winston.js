const winston = require('winston');
const path = require('path');

var logger = winston.createLogger({
    transports: [
        //new (winston.transports.Console)({json: false, timestamp: true}),
        new winston.transports.File({filename:path.join(__dirname, '../logs/debug.log')})
    ],
    exceptionHandlers: [
        //new (winston.transports.Console)({json: false, timestamp: true}),
        new winston.transports.File({filename: path.join(__dirname, '../logs/error.log')})
    ],
    exitOnError: false
});

/*logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    }
}*/

module.exports = logger;