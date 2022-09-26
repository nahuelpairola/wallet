const { StatusCodes } = require('http-status-codes')
const CustomAPIError = require('../custom-api')

class TypeNotFoundError extends CustomAPIError {
    constructor(message){
        super(message)
        this.statusCode = StatusCodes.NOT_FOUND // by default
    }
}

module.exports = TypeNotFoundError