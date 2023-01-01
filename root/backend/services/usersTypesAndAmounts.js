// file to avoid circular dependencies

const { NOT_ENOUGH_DATA, USER_NOT_FOUND } = require('../errors/error-msg-list')
const { UserSearchError, UserNotFoundError, UserUpdateError } = require('../errors/user-errors')

const getAccountBalanceById = async (id) => {
    if(!id) throw new UserSearchError(NOT_ENOUGH_DATA)
    const user = await require('./user').getById(id)
    if(!user) UserNotFoundError(USER_NOT_FOUND)
    return user.accountBalance
}

const calculateAccountBalanceByIdAndNewAmount = async (id,amount) => {
    if(!id || !amount.quantity || !amount.movement) UserUpdateError(NOT_ENOUGH_DATA)
    let accountBalance = await getAccountBalanceById(id)
    if(amount.movement === 'input') accountBalance += amount.quantity
    else accountBalance -= amount.quantity
    return await require('./user').updateAccountBalanceById(id,accountBalance)
}

const calculateAccountBalanceByIdAndDeletedAmount = async (id,amount) => {
    if(!id || !amount.quantity || !amount.movement) UserUpdateError(NOT_ENOUGH_DATA)
    let accountBalance = await getAccountBalanceById(id)
    if(amount.movement === 'input') accountBalance -= amount.quantity
    else accountBalance += amount.quantity
    return await require('./user').updateAccountBalanceById(id,accountBalance)
}

const calculateAccountBalanceByIdAndUpdatedAmount = async (id,amountToUpdate,amountUpdated) => {
    if(!id || !amountToUpdate.quantity || !amountToUpdate.movement || !amountUpdated.quantity || !amountUpdated.movement) UserUpdateError(NOT_ENOUGH_DATA)
    let accountBalance = await getAccountBalanceById(id)
    
    if(amountToUpdate.movement === 'input') accountBalance -= amountToUpdate.quantity
    else accountBalance += amountToUpdate.quantity
    
    if(amountUpdated.movement === 'input') accountBalance += amountUpdated.quantity
    else accountBalance -= amountUpdated.quantity
    
    return await require('./user').updateAccountBalanceById(id,accountBalance)
}

module.exports.getAccountBalanceById = getAccountBalanceById
module.exports.calculateAccountBalanceByIdAndDeletedAmount = calculateAccountBalanceByIdAndDeletedAmount
module.exports.calculateAccountBalanceByIdAndNewAmount = calculateAccountBalanceByIdAndNewAmount
module.exports.calculateAccountBalanceByIdAndUpdatedAmount = calculateAccountBalanceByIdAndUpdatedAmount
