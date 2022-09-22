const { StatusCodes } = require('http-status-codes')
const { JsonWebTokenError } = require('jsonwebtoken')

const errorHandlerMiddleware = async (error, req, res, next) => {

  console.log("Error Handling Middleware called")
  console.log('Path: ', req.path)
  console.log(error)

  let customError = {
    msg: error.message || 'INTERNAL SERVER ERROR',
    error: error,
    statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
  }
  
  if(error instanceof JsonWebTokenError) {
    customError.statusCode = StatusCodes.UNAUTHORIZED
    customError.msg = error.message.toUpperCase()
  }

  return res.status(customError.statusCode).json({msg: customError.msg})
}

module.exports = errorHandlerMiddleware
