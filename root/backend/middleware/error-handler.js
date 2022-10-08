const { StatusCodes } = require('http-status-codes')
const { JsonWebTokenError , TokenExpiredError } = require('jsonwebtoken')
const {BaseError} = require('sequelize')
const {UserCreateError, UserSearchError, UserUpdateError, UserDeleteError} = require('../errors/user-errors')
const { TypeDeleteError, TypeCreateError } = require('../errors/type-errors')
const { AmountDeleteError, AmountUpdateError } = require('../errors/amount-errors')
const {
  USER_ALREADY_CREATED, 
  PASSWORD_INCORRECT, 
  TOKEN_EXPIRED, 
  TYPE_USED_IN_AMOUNT, 
  USER_EMAIL_NOT_AVAILABLE, 
  USER_UPDATING_UNAUTHORIZED, 
  USER_DELETING_UNAUTHORIZED, 
  USER_NOT_FOUND, 
  AMOUNT_NOT_FOUND, 
  TYPE_ALREADY_CREATED, 
  TYPE_DELETE_UNAUTHORIZED,
  TYPE_NOT_FOUND,
  NOT_ENOUGH_DATA
} = require('../errors/error-msg-list')
 
const errorHandlerMiddleware = async (error, req, res, next) => {
  
  let customError = {
    msg: error.message || 'INTERNAL SERVER ERROR',
    error: error,
    statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
  }
  // changing msg or status codes depends of condition
  if(error instanceof TypeError || error.message === NOT_ENOUGH_DATA || error instanceof BaseError) {
    error.message = 'PLEASE CONTACT WITH SUPPORT, INTERNAL SERVER ERROR'
  }
  if(error instanceof JsonWebTokenError) {
    customError.statusCode = StatusCodes.UNAUTHORIZED
    customError.msg = error.message.toUpperCase()
  }
  if(error instanceof TokenExpiredError) {
    customError.statusCode = StatusCodes.UNAUTHORIZED
    customError.msg = error.message.toUpperCase()+TOKEN_EXPIRED
  }
  if(error instanceof UserCreateError && error.message === USER_ALREADY_CREATED) {
    error.statusCode = StatusCodes.CONFLICT
    customError.statusCode = error.statusCode 
  }
  if(error instanceof UserSearchError && error.message === PASSWORD_INCORRECT) {
    error.statusCode = StatusCodes.UNAUTHORIZED
    customError.statusCode = error.statusCode
  }
  if(error instanceof UserUpdateError && error.message === USER_EMAIL_NOT_AVAILABLE) {
    error.statusCode= StatusCodes.CONFLICT
    customError.statusCode = error.statusCode
  }
  if(error instanceof UserUpdateError && error.message === USER_UPDATING_UNAUTHORIZED) {
    error.statusCode= StatusCodes.FORBIDDEN
    customError.statusCode = error.statusCode
  }
  if(error instanceof UserDeleteError && error.message === USER_DELETING_UNAUTHORIZED) {
    error.statusCode= StatusCodes.FORBIDDEN
    customError.statusCode = error.statusCode
  }
  if(error instanceof UserDeleteError && error.message === USER_NOT_FOUND) {
    error.statusCode= StatusCodes.NOT_FOUND
    customError.statusCode = error.statusCode
  }
  if(error instanceof TypeCreateError && error.message === TYPE_ALREADY_CREATED) {
    error.statusCode = StatusCodes.CONFLICT
    customError.statusCode = error.statusCode
  }  
  if(error instanceof TypeDeleteError && error.message === TYPE_DELETE_UNAUTHORIZED) {
    error.statusCode = StatusCodes.UNAUTHORIZED
    customError.statusCode = error.statusCode
  }
  if(error instanceof TypeDeleteError && error.message === TYPE_USED_IN_AMOUNT) {
    error.statusCode= StatusCodes.CONFLICT
    customError.statusCode = error.statusCode
  }
  if(error instanceof AmountUpdateError && error.message === TYPE_NOT_FOUND) {
    error.statusCode= StatusCodes.NOT_FOUND
    customError.statusCode = error.statusCode
  }
  if(error instanceof AmountDeleteError && error.message === AMOUNT_NOT_FOUND) {
    error.statusCode= StatusCodes.NOT_FOUND
    customError.statusCode = error.statusCode
  }

  console.log("Error Handling Middleware called")
  console.log('Path: ', req.path)
  console.log(error)

  return res.status(customError.statusCode).json({msg: customError.msg})
}

module.exports = errorHandlerMiddleware
