const { StatusCodes } = require('http-status-codes')
const CustomAPIError = require('./custom-api')

class RepositoryError extends CustomAPIError {
    constructor(message){
        super(message)
        this.name = 'REPOSITORY_ERROR'
        this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    }
}

module.exports = RepositoryError