const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-api");

class BadRequestError extends CustomAPIError {
    constructor(message){
        super(message)
        this.name = 'BAD_REQUEST_ERROR'
        this.statusCode = StatusCodes.BAD_REQUEST
    }
}

module.exports = BadRequestError