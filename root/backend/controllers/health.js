const { StatusCodes, OK } = require("http-status-codes")
const {INTERNAL_SERVER_ERROR } = require('../errors/error-msg-list')

const {isConnectionHealthy} = require('../services/health')

const healthCheck = async (req, res) => {
    if(isConnectionHealthy()) {
        res.status(StatusCodes.OK).json({msg: "Everything is fine :)"})
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: INTERNAL_SERVER_ERROR})
    }
}

module.exports = { healthCheck }