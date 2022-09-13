const { StatusCodes } = require('http-status-codes')

const {
  PASSWORD_INCORRECT, 
  TOKEN_UNAUTHORIZED,
  USER_NOT_FOUND,
  NOT_ENOUGH_DATA,
  USER_ALREADY_CREATED,
  USER_CREATION_ERROR,
  USER_SEARCHING_ERROR,
  TYPE_CREATION_ERROR,
  TYPE_ALREADY_CREATED,
  TYPE_SEARCHING_ERROR,
  TYPE_DELETING_ERROR,
  TYPE_UPDATING_ERROR,

} = require('../errors/error-msg-list')

const errorHandlerMiddleware = async (error, req, res, next) => {
  console.log("Error Handling Middleware called")
  console.log('Path: ', req.path)
  console.log(error)
  
  let CustomError = {
    msg: error.message,// || 'Internal Server Error',
    error: error,
    statusCode: error.statusCode,
  }
  return res.status(CustomError.statusCode).json({msg: CustomError.msg})
}

module.exports = errorHandlerMiddleware



  // console.log(CustomError); //*************************************************** */
  
  // // status code assingment for service and repository msg
  // if (CustomError.origin !== 'BAD_REQUEST_ERROR' ||
  //     CustomError.origin !== 'NOT_FOUND_ERROR' ||
  //     CustomError.origin !== 'REPOSITORY_ERROR' ||
  //     CustomError.origin !== 'SERVICE_ERROR') {
  //   if(CustomError.msg === PASSWORD_INCORRECT) CustomError.statusCode = StatusCodes.UNAUTHORIZED
  //   if(CustomError.msg === TOKEN_UNAUTHORIZED) CustomError.statusCode = StatusCodes.UNAUTHORIZED
  //   if(CustomError.msg === NOT_ENOUGH_DATA) CustomError.statusCode = StatusCodes.BAD_REQUEST
  //   if(CustomError.msg === USER_NOT_FOUND) CustomError.statusCode = StatusCodes.NOT_FOUND
  //   if(CustomError.msg === USER_ALREADY_CREATED) CustomError.statusCode = StatusCodes.CONFLICT
  //   if(CustomError.msg === USER_CREATION_ERROR) CustomError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  //   if(CustomError.msg === USER_SEARCHING_ERROR) CustomError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  //   if(CustomError.msg === TYPE_CREATION_ERROR) CustomError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  //   if(CustomError.msg === TYPE_ALREADY_CREATED) CustomError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  //   if(CustomError.msg === TYPE_SEARCHING_ERROR) CustomError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  //   if(CustomError.msg === TYPE_DELETING_ERROR) CustomError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  //   if(CustomError.msg === TYPE_UPDATING_ERROR) CustomError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  // }
