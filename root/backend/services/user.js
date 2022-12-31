
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const repository = require('../repository/user')

const {
    isUserAnAdmin
} = require('../services/usersTypesAndAmounts')

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
    const userMatched = await repository.getByEmail(user.email)
    if(userMatched) throw new UserCreateError(USER_ALREADY_CREATED)
    user.created_at = new Date() // add time when it was created
    user.password = await generatePassword(user.password)
    const userCreated = await create({ // store in db
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: user.password,
        created_at: user.created_at,
        role: user.role
    })
    const token = generateTokenByEmail(userCreated.email)
    return ( { user:deletePassword(user), token:token } )
}

const updateUserByIdUserAndNewValuesGetUserAndNewToken = async ({id: userId, user , newValues}) => {
    if( !userId ||
        !user.id ||
        !user.email ||
        !newValues.first_name || 
        !newValues.last_name || 
        !newValues.email || 
        !newValues.password ) throw new UserUpdateError(NOT_ENOUGH_DATA)

    if(userId !== user.id) throw new UserUpdateError(USER_UPDATING_UNAUTHORIZED) // check user acces vs user id to update
    
    const isAnyUserWithNewEmail = await getUserByEmailFromDB(newValues.email) //check if the email is available
    if(isAnyUserWithNewEmail && Number(isAnyUserWithNewEmail.id) !== userId) throw new UserUpdateError(USER_EMAIL_NOT_AVAILABLE)

    newValues.password = await generatePassword(newValues.password) // cript new passwrod

    const updatedUser = await updateUserByIdFirstNameLastNameEmailAndPasswordInDB({
        id: userId,
        first_name: newValues.first_name,
        last_name: newValues.last_name,
        email: newValues.email,
        password: newValues.password
    })
    
    if(!updatedUser) throw new UserUpdateError(USER_UPDATING_ERROR)
    else {
        const token = generateTokenByEmail(updatedUser.email)
        return {user:updatedUser,token:token}
    }
}

const updateByIdAndValues = async ({id: userId, values: values}) => {
    if( !userId ||
        !values.id ||
        !user.email ||
        !values.first_name || 
        !values.last_name ||
        !values.email ||
        !values.password ) throw new UserUpdateError(NOT_ENOUGH_DATA)

    if(userId !== values.id) throw new UserUpdateError(USER_UPDATING_UNAUTHORIZED) // check user acces vs user id to update
    
    const isEmailUsed = await getByEmail(values.email) // check if the email is available
    if(isEmailUsed && isEmailUsed.id !== userId) throw new UserUpdateError(USER_EMAIL_NOT_AVAILABLE)
    
    values.password = await generatePassword(values.password) // cript new passwrod

    const updatedUser = await update({
        id: userId,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password
    })
    
    if(!updatedUser) throw new UserUpdateError(USER_UPDATING_ERROR)
    const token = generateTokenByEmail(updatedUser.email)
    return {user:updatedUser,token:token}
}

const deleteByIdAndUser = async ({id: userId, user:{id}}) => {
    if(!userId || !id ) throw new UserDeleteError(NOT_ENOUGH_DATA)
    if(userId !== id) throw new UserDeleteError(USER_DELETING_UNAUTHORIZED)
    const userMatched = await repository.getById(userId)
    if(!userMatched) throw new UserDeleteError(USER_NOT_FOUND)
    if(userMatched.id !== userId) throw new UserDeleteError(USER_DELETING_UNAUTHORIZED)
    // check user role
    if(isUserAnAdmin(userMatched)) { 
        // user is an admin, just delete user
        const userDeleted = await repository.deleteById(userId)
        return userDeleted
    } else {
        // user is a normal one:
        // 1. delete amounts
        // 2. delete custom types
        // 3. delete user
        const amountsDeleted = await deleteAllAmountsOfCreatorByCreatorIdReturnAmountsAndAccountBalance(userId)
        const customTypesDeleted = await deleteAllCustomTypesOfCreatorByCreatorId(userId)
        const userDeleted = await deleteUserByIdInDB(userId)
        return {user:userDeleted,nTypes:customTypesDeleted.length,nAmounts:amountsDeleted.length}
    }
}

const getAccountBalanceById = async (id) => {
    if(!id) throw new UserSearchError(NOT_ENOUGH_DATA)
    const user = await repository.getById(id)
    if(!user) UserNotFoundError(USER_NOT_FOUND)
    return user.accountBalance
}

const calculateAccountBalanceByIdAndNewAmount = async (id,amount) => {
    if(!id || !amount.quantity || !amount.movement) UserUpdateError(NOT_ENOUGH_DATA)
    let accountBalance = await getAccountBalanceById(id)
    if(amount.movement === 'input') accountBalance += amount.quantity
    else accountBalance -= amount.quantity
    return await repository.updateAccountBalance(id,accountBalance)
}

const calculateAccountBalanceByIdAndDeletedAmount = async (id,amount) => {
    if(!id || !amount.quantity || !amount.movement) UserUpdateError(NOT_ENOUGH_DATA)
    let accountBalance = await getAccountBalanceById(id)
    if(amount.movement === 'input') accountBalance -= amount.quantity
    else accountBalance += amount.quantity
    return await repository.updateAccountBalance(id,accountBalance)
}

const calculateAccountBalanceByIdAndUpdatedAmount = async (id,amountToUpdate,amountUpdated) => {
    if(!id || !amountToUpdate.quantity || !amountToUpdate.movement || !amountUpdated.quantity || !amountUpdated.movement) UserUpdateError(NOT_ENOUGH_DATA)
    let accountBalance = await getAccountBalanceById(id)
    
    if(amountToUpdate.movement === 'input') accountBalance -= amountToUpdate.quantity
    else accountBalance += amountToUpdate.quantity
    
    if(amountUpdated.movement === 'input') accountBalance += amountUpdated.quantity
    else accountBalance -= amountUpdated.quantity
    
    return await repository.updateAccountBalance(id,accountBalance)
}

module.exports = {
    getByToken,
    updateByIdAndValues,
    deleteByIdAndUser,
    getByEmailAndPassword,
    register,
    getAccountBalanceById,
    calculateAccountBalanceByIdAndNewAmount,
    calculateAccountBalanceByIdAndDeletedAmount,
    calculateAccountBalanceByIdAndUpdatedAmount
}