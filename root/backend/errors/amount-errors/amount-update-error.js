const { StatusCodes } = require('http-status-codes')
const CustomAPIError = require('../custom-api')

class AmountUpdateError extends CustomAPIError {
    constructor(message){
        super(message)
        this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR // by default
    }
}

module.exports = AmountUpdateError