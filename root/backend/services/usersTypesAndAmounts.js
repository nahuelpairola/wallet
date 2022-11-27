// file to avoid circular dependencies

const { NOT_ENOUGH_DATA, USER_NOT_FOUND } = require('../errors/error-msg-list')
const { UserUpdateError, UserSearchError } = require('../errors/user-errors')
const {getAtLeastOneAmountUsingThisTypeIdInDB} = require('../repository/amount')
const { getUserByIdFromDB, updateUserAccountBalanceByUserIdAndNewAccountBalanceInDB } = require('../repository/user')

const isUserAnAdmin = (user) => {
    if(!user.role) throw new UserSearchError(PROVIDE_ALL_DATA)
    if(user.role === 'admin') return true
    else return false
}

const isAnAmountUsingThisTypeId = async (typeId) => {
    if(!typeId) throw new ServiceError(NOT_ENOUGH_DATA)
    const amount = await getAtLeastOneAmountUsingThisTypeIdInDB(typeId)
    if(amount) return true
    else return false
}

const calculateNewAccountBalanceUserByUserIdAndNewAmount = async ({userId,amount}) => {
    if(!userId || !amount ) throw new UserUpdateError(NOT_ENOUGH_DATA)
    const user = await getUserByIdFromDB(userId)
    let newAccountBalance = 0.
    if(amount.movement === 'input') {
        newAccountBalance = user.accountBalance + amount.quantity
    } else { // movement = output
        newAccountBalance = user.accountBalance - amount.quantity
    }    
    const updatedUser = await updateUserAccountBalanceByUserIdAndNewAccountBalanceInDB({userId,accountBalance:newAccountBalance})
    return updatedUser.accountBalance
}

const calculateNewAccountBalanceUserByUserIdAndDeletedAmount = async ({userId,amount}) => {
    if(!userId || !amount ) throw new UserUpdateError(NOT_ENOUGH_DATA)
    const user = await getUserByIdFromDB(userId)
    let newAccountBalance = 0.
    if(amount.movement === 'input') {
        newAccountBalance = user.accountBalance - amount.quantity
    } else { // movement = output
        newAccountBalance = user.accountBalance + amount.quantity
    }
    const updatedUser = await updateUserAccountBalanceByUserIdAndNewAccountBalanceInDB({userId,accountBalance:newAccountBalance})
    return updatedUser.accountBalance
}

const getAccountBalanceByUserId = async (userId) => {
    if(!userId) throw new UserSearchError(NOT_ENOUGH_DATA)
    const user = await getUserByIdFromDB(userId)
    if(!user) throw new UserSearchError(USER_NOT_FOUND)
    else return user.accountBalance
}

const resetAccountBalanceByUserId = async (userId) => {
    if(!userId) throw new UserUpdateError(NOT_ENOUGH_DATA)
    const user = await getUserByIdFromDB(userId)
    if(!user) throw new UserSearchError(USER_NOT_FOUND)
    const newAccountBalance = 0.
    const updatedUser = await updateUserAccountBalanceByUserIdAndNewAccountBalanceInDB({userId,accountBalance:newAccountBalance})
    return updatedUser.accountBalance
}


module.exports = {
    isUserAnAdmin,
    isAnAmountUsingThisTypeId,
    calculateNewAccountBalanceUserByUserIdAndNewAmount,
    calculateNewAccountBalanceUserByUserIdAndDeletedAmount,
    getAccountBalanceByUserId,
    resetAccountBalanceByUserId,
}
