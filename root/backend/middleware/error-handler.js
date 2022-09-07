const { StatusCodes } = require('http-status-codes')
const {PASSWORD_INCORRECT, 
      TOKEN_UNAUTHORIZED,
      USER_NOT_FOUND,
      NOT_ENOUGH_DATA} = require('../errors/custom-error-msg')

const errorHandlerMiddleware = (error, req, res, next) => {
  console.log("Error Handling Middleware called")
  console.log('Path: ', req.path)
  console.error('Error: ', error)
  
  let CustomError = {
    statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: error.message || 'Internal Server Error',
    error:error,
  }

  if(CustomError.msg === PASSWORD_INCORRECT) CustomError.statusCode = StatusCodes.UNAUTHORIZED
  if(CustomError.msg === TOKEN_UNAUTHORIZED) CustomError.statusCode = StatusCodes.UNAUTHORIZED
  if(CustomError.msg === USER_NOT_FOUND) CustomError.statusCode = StatusCodes.NOT_FOUND
  if(CustomError.msg === NOT_ENOUGH_DATA) CustomError.statusCode = StatusCodes.BAD_REQUEST
  
  return res.status(CustomError.statusCode).json({msg: CustomError.msg})

}

module.exports = errorHandlerMiddleware
