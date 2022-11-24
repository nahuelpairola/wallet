const { StatusCodes, OK } = require("http-status-codes")
const {INTERNAL_SERVER_ERROR } = require('../errors/error-msg-list')

const {sequelize} = require('../db/connect')

const healthCheck = async (req, res) => {
    const result = await sequelize.query('SELECT 1+1 AS result')
    if(result[0][0].result===2) {
        res.status(StatusCodes.OK).json({msg: "Everything is fine :)"})
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: INTERNAL_SERVER_ERROR})
    }
}

module.exports = { healthCheck }