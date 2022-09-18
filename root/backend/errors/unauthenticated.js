const { StatusCodes } = require('http-status-codes')
const CustomAPIError = require('./custom-api')

class UnauthenticatedError extends CustomAPIError {
    constructor(message){
        super(message)
        this.name = 'UNAUTHORIZED_ERROR'
        this.statusCode = StatusCodes.UNAUTHORIZED
    }
}

module.exports = UnauthenticatedError