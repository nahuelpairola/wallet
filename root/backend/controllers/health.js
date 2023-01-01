const { StatusCodes, OK } = require("http-status-codes")
const {INTERNAL_SERVER_ERROR } = require('../errors/error-msg-list')

const {isConnectionHealthy} = require('../db/healthyCheck')

const healthCheck = async (req, res) => {
    if(isConnectionHealthy()) {
        res.status(StatusCodes.OK).json({success: true, message: "Everything is fine :)"})
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: INTERNAL_SERVER_ERROR})
    }
}

module.exports = { healthCheck }