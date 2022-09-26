const { StatusCodes } = require('http-status-codes')
const CustomAPIError = require('../custom-api')

class AmountDeleteError extends CustomAPIError {
    constructor(message){
        super(message)
        this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR // by default
    }
}

module.exports = AmountDeleteError