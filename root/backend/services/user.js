
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const repository = require('../repository/user')
const amountServices = require('../services/amount')
const typeServices = require('../services/type')

const { PASSWORD_INCORRECT,
        USER_NOT_FOUND,
        NOT_ENOUGH_DATA,
        USER_ALREADY_CREATED,
        USER_UPDATING_ERROR,
        USER_UPDATING_UNAUTHORIZED,
        USER_DELETING_UNAUTHORIZED,
        USER_EMAIL_NOT_AVAILABLE,
        TOKEN_UNAUTHORIZED,
        } = require('../errors/error-msg-list')

const {
    UserSearchError, 
    UserNotFoundError, 
    UserCreateError, 
    UserUpdateError, 
    UserDeleteError 
} = require('../errors/user-errors')

const generatePassword = async (password) => {
    const salt = await bcrypt.genSalt(10) // generate crypted password
    passwordSaltedAndHashed = await bcrypt.hash(password, salt)
    return passwordSaltedAndHashed
}

const generateTokenByEmail = (userEmail) => {
    const token = jwt.sign({email: userEmail},
                                process.env.JWT_SECRET,
                                {expiresIn:process.env.JWT_LIFETIME})
    return token
}

const deletePassword = (user) => {
    delete user.password
    return user
}

const getByEmailAndPassword = async ({email,password}) => {
    if(!email || !password) throw new UserSearchError(NOT_ENOUGH_DATA)
    const userMatched = await repository.getByEmail(email)
    if(!userMatched) throw new UserNotFoundError(USER_NOT_FOUND)
    // check password
    const isMatch = await bcrypt.compare(password, userMatched.password)
    if ( !isMatch ) throw new UserSearchError(PASSWORD_INCORRECT)
    // generate token
    const token = jwt.sign({email: userMatched.email},
                            process.env.JWT_SECRET,
                            {expiresIn:process.env.JWT_LIFETIME})
    return {
        user: deletePassword(userMatched),
        token:token
    }
}

const getByToken = async (token) => {
    const payload = jwt.verify(token, process.env.JWT_SECRET)    
    const userMatched = await repository.getByEmail(payload.email)
    if(!userMatched) throw new UserSearchError(TOKEN_UNAUTHORIZED)
    return deletePassword(userMatched)
}

const register = async (user) => {
    if(!user.first_name ||
        !user.last_name || 
        !user.email ||
        !user.password) throw new UserCreateError(NOT_ENOUGH_DATA)
    // check if emails user exists
    if(await repository.getByEmail(user.email)) throw new UserCreateError(USER_ALREADY_CREATED)
    user.created_at = new Date() // add time when it was created
    user.password = await generatePassword(user.password)
    const userCreated = await repository.create( // store in db
        user.first_name,
        user.last_name,
        user.email,
        user.password,
        user.created_at,
        user.role
    )
    const token = generateTokenByEmail(userCreated.email)
    return ( { user:userCreated, token:token } )
}

const updateByIdAndValues = async (userId, values) => {
    if( !userId ||
        !values.id ||
        !values.first_name || 
        !values.last_name ||
        !values.email ||
        !values.password ) throw new UserUpdateError(NOT_ENOUGH_DATA)

    if(userId !== values.id) throw new UserUpdateError(USER_UPDATING_UNAUTHORIZED) // check user access vs user id to update
    
    const isEmailUsed = await repository.getByEmail(values.email) // check if the email is available
    if(isEmailUsed && isEmailUsed.id !== userId) throw new UserUpdateError(USER_EMAIL_NOT_AVAILABLE)
    
    values.password = await generatePassword(values.password) // cript new password

    const updatedUser = await repository.updatePersonalData(userId,values.first_name,values.last_name,values.email,values.password)
    
    if(!updatedUser) throw new UserUpdateError(USER_UPDATING_ERROR)
    const token = generateTokenByEmail(updatedUser.email)
    return {user:updatedUser,token:token}
}

const updateAccountBalanceById = async (id,accountBalance) => {
    if(!id || typeof accountBalance === 'undefined') throw new UserUpdateError(NOT_ENOUGH_DATA)
    const user = await repository.updateAccountBalance(id,accountBalance)
    return  user.accountBalance
}

const deleteByIdAndUser = async (userId, id) => {
    if(!userId || !id ) throw new UserDeleteError(NOT_ENOUGH_DATA)
    if(userId !== id) throw new UserDeleteError(USER_DELETING_UNAUTHORIZED)
    const userMatched = await repository.getById(userId)
    if(!userMatched) throw new UserDeleteError(USER_NOT_FOUND)
    if(userMatched.id !== userId) throw new UserDeleteError(USER_DELETING_UNAUTHORIZED)
    // check user role
    if(userMatched.role === 'admin') { 
        // user is an admin, just delete user
        const userDeleted = await repository.deleteById(userId)
        return userDeleted
    } else {
        // user is a normal one:
        // 1. delete amounts
        // 2. delete custom types
        // 3. delete user
        const nAmounts = await amountServices.deleteAllByCreator(userId)
        const nTypes = await typeServices.deleteAllByCreator(userId)
        const userDeleted = await repository.deleteById(userId)
        return {user:userDeleted,nTypes,nAmounts}
    }
}

const getById = async (id) => {
    if(!id) throw new UserSearchError(NOT_ENOUGH_DATA)
    const user = await repository.getById(id)
    if(!user) UserNotFoundError(USER_NOT_FOUND)
    return user
}

module.exports = {
    getByToken,
    getById,
    updateByIdAndValues,
    deleteByIdAndUser,
    getByEmailAndPassword,
    register,
    updateAccountBalanceById,
}
