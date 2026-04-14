const { logger } = require("../utils/logger")

module.exports = (err, req, res, next) => {
    logger.error(err.message, { stack: err.stack });
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal server error"
    })
}