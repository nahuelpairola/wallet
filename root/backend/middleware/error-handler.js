const { StatusCodes } = require('http-status-codes')
const { JsonWebTokenError , TokenExpiredError } = require('jsonwebtoken')
const {BaseError} = require('sequelize')
const {UserCreateError, UserSearchError, UserUpdateError} = require('../errors/user-errors')
const {USER_ALREADY_CREATED, PASSWORD_INCORRECT, ACCESS_UNAUTHORIZED, TOKEN_EXPIRED, TYPE_USED_IN_AMOUNT, USER_EMAIL_NOT_AVAILABLE, USER_UPDATING_UNAUTHORIZED} = require('../errors/error-msg-list')
const { TypeDeleteError } = require('../errors/type-errors')
 
const errorHandlerMiddleware = async (error, req, res, next) => {
  
  let customError = {
    msg: error.message || 'INTERNAL SERVER ERROR',
    error: error,
    statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
  }
  
  if(error instanceof TypeError) {
    customError.message = 'INTERNAL SERVER ERROR'
  }
  if(error instanceof JsonWebTokenError) {
    customError.statusCode = StatusCodes.UNAUTHORIZED
    customError.msg = error.message.toUpperCase()
  }
  if(error instanceof TokenExpiredError) {
    customError.statusCode = StatusCodes.UNAUTHORIZED
    customError.msg = error.message.toUpperCase()+TOKEN_EXPIRED
  }
  if(error instanceof BaseError) {
    customError.message = 'INTERNAL SERVER ERROR'
  }
  if(error instanceof UserCreateError && error.message === USER_ALREADY_CREATED) {
    error.statusCode = StatusCodes.CONFLICT
    customError.statusCode = error.statusCode 
  }
  if(error instanceof UserSearchError && error.message === PASSWORD_INCORRECT) {
    error.statusCode = StatusCodes.UNAUTHORIZED
    customError.statusCode = error.statusCode
  }
  if(error instanceof TypeDeleteError && error.message === ACCESS_UNAUTHORIZED) {
    error.statusCode = StatusCodes.UNAUTHORIZED
    customError.statusCode = error.statusCode
  }
  if(error instanceof TypeDeleteError && error.message === TYPE_USED_IN_AMOUNT) {
    error.statusCode= StatusCodes.CONFLICT
    customError.statusCode = error.statusCode
  }
  if(error instanceof UserUpdateError && error.message === USER_EMAIL_NOT_AVAILABLE) {
    error.statusCode= StatusCodes.CONFLICT
    customError.statusCode = error.statusCode
  }
  if(error instanceof UserUpdateError && error.message === USER_UPDATING_UNAUTHORIZED) {
    error.statusCode= StatusCodes.UNAUTHORIZED
    customError.statusCode = error.statusCode
  }

  console.log("Error Handling Middleware called")
  console.log('Path: ', req.path)
  console.log(error)

  return res.status(customError.statusCode).json({msg: customError.msg})
}

module.exports = errorHandlerMiddleware
