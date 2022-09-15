const { StatusCodes } = require('http-status-codes')
const CustomAPIError = require('./custom-api')

class ServiceError extends CustomAPIError {
    constructor(message){
        super(message)
        this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    }
}

module.exports = ServiceError