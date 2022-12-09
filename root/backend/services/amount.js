
const { ServiceError} = require('../errors')
const { 
    AmountSearchError,
    AmountCreateError,
    AmountDeleteError,
    AmountUpdateError
} = require('../errors/amount-errors')
const {
    NOT_ENOUGH_DATA,
    AMOUNT_CREATION_ERROR, 
    TYPE_NOT_FOUND,
    AMOUNT_NOT_FOUND, 
    AMOUNT_UPDATING_ERROR, 
    ACCESS_UNAUTHORIZED 
} = require('../errors/error-msg-list')

const {
    createAmountInDB,
    getAmountByIdFromDB,
    getAmountsByCreatorIdAndFilteringOptionFromDB,
    countAmountsByCreatorIdAndFilteringOptionFromDB,
    deleteAmountByIdInDB,
    updateAmountByIdQuantityAndAmountTypeInDB,
} = require('../repository/amount')

const { 
    getTypesByMovementNameAndUserId,
} = require('./type')

const {
    resetAccountBalanceByUserId,
    getAccountBalanceByUserId,
    calculateNewAccountBalanceUserByUserIdAndDeletedAmount,
    calculateNewAccountBalanceUserByUserIdAndNewAmount,
} = require('./usersTypesAndAmounts')

const getAmountsDataByCreatorIdAndFilteringOption = async ({ creatorId, filteringOption}) => {
    if(!creatorId) throw new AmountSearchError(NOT_ENOUGH_DATA)
    let result = await getAmountsByCreatorIdAndFilteringOptionFromDB({creatorId, filteringOption})
    const accountBalance = await getAccountBalanceByUserId(creatorId) // get account balance
    return {
        accountBalance: accountBalance,
        pagination:result.pagination,
        amounts:result.amounts,
    }
}

const getAmountById = async (amountId) => {
    if(!amountId) throw new AmountSearchError(NOT_ENOUGH_DATA)
    const amount = await getAmountByIdFromDB(amountId)
    return amount
}

const createAmountByValuesReturnAmountCreatedAndAccountBalance = async (values) => {
    if( !values.quantity || 
        !values.movement || 
        !values.type ||
        !values.creatorId ) throw new AmountCreateError(NOT_ENOUGH_DATA)
        // check if the type (movement and name) is a default one or its a custom one and belongs to the user
    const typeMatched = await getTypesByMovementNameAndUserId({movement:values.movement,name:values.type,userId:values.creatorId})
    if(!typeMatched) throw new AmountCreateError(TYPE_NOT_FOUND)
    const amountToCreate = {
        quantity: Number(values.quantity),
        amountType: Number(typeMatched.id),
        creator: Number(values.creatorId),
    }
    if(values.created_at) amountToCreate.created_at = new Date(values.created_at)
    else amountToCreate.created_at = new Date()

    const amountCreated = await createAmountInDB(amountToCreate)
    if(!amountCreated) throw new AmountCreateError(AMOUNT_CREATION_ERROR)
    // calculate new account balance
    const newAccountBalance = await calculateNewAccountBalanceUserByUserIdAndNewAmount({userId:amountCreated.creator,amount:amountCreated})
    return {amount:amountCreated,accountBalance:newAccountBalance}
}

const deleteAllAmountsOfCreatorByCreatorIdReturnAmountsAndAccountBalance = async (creatorId) => {
    if(!creatorId) throw new AmountDeleteError(NOT_ENOUGH_DATA)
    const amountsOfCreator = await getAmountsByCreatorIdFromDB(creatorId)
    if(amountsOfCreator.length === 0) return [] // no amounts to delete
    if(amountsOfCreator.length>1) {
        const amountsDeleted = await Promise.all(amountsOfCreator.map(async (amount) => {
            await deleteAmountByIdInDB(amount.id)
        }))
        const accountBalance = await resetAccountBalanceByUserId(creatorId)
        return {amounts:amountsDeleted,accountBalance:accountBalance}
    } else {
        const amountDeleted = await deleteAmountByIdInDB(amountsOfCreator[0].id)
        const accountBalance = await resetAccountBalanceByUserId(creatorId)
        return {amounts:amountDeleted,accountBalance:accountBalance}
    }
}

const deleteAmountByIdAndCreatorIdReturnAmountAndAccountBalance = async ({amountId,creatorId}) => {
    if(!amountId || !creatorId) throw new AmountDeleteError(NOT_ENOUGH_DATA)
    const amountToDelete = await getAmountById(amountId)
    if(!amountToDelete) throw new AmountDeleteError(AMOUNT_NOT_FOUND)
    if(Number(amountToDelete.creator) !== creatorId) throw new AmountDeleteError(ACCESS_UNAUTHORIZED)   
        const amountDeleted = await deleteAmountByIdInDB(amountId)
        const accountBalance = await calculateNewAccountBalanceUserByUserIdAndDeletedAmount({userId:creatorId,amount:amountDeleted})
    return {amount:amountDeleted,accountBalance}
}

const updateAmountByIdAndNewValues = async ({amountId,newValues:{quantity,amountType}}) => {
    if(!amountId || !quantity || !amountType) throw new AmountUpdateError(NOT_ENOUGH_DATA)
    const amountUpdated = await updateAmountByIdQuantityAndAmountTypeInDB({id:amountId,quantity,amountType})
    if(!amountUpdated) return null
    else return amountUpdated
}

const updateAmountByIdCreatorIdAndNewValuesReturnAmountAndAccountBalance = async ({amountId, creatorId, newValues: {quantity, movement, type}}) => {
    if( !amountId || !creatorId || !quantity || !movement || !type) throw new ServiceError(NOT_ENOUGH_DATA)
    const amountMatched = await getAmountById(amountId)
    if(!amountMatched) throw new AmountUpdateError(AMOUNT_NOT_FOUND)
    if(amountMatched.creator !== creatorId) throw new AmountUpdateError(ACCESS_UNAUTHORIZED)
    // check if the type (movement and name) is a default one OR is a custom one
    const newType = await getTypesByMovementNameAndUserId({movement, name: type, userId:creatorId})
    if(!newType) throw new AmountUpdateError(TYPE_NOT_FOUND)
    const amountUpdated = await updateAmountByIdAndNewValues({amountId,newValues:{quantity,amountType:newType.id}})
    if(!amountUpdated) throw new AmountUpdateError(AMOUNT_UPDATING_ERROR)
    let accountBalance = 0.
    if(amountUpdated.quantity !== amountMatched.quantity || amountUpdated.movement !== amountMatched.movement) {
        await calculateNewAccountBalanceUserByUserIdAndDeletedAmount({userId:creatorId,amount:amountMatched})
        accountBalance = await calculateNewAccountBalanceUserByUserIdAndNewAmount({userId:creatorId,amount:amountUpdated})
    }
    return {amount: amountUpdated, accountBalance: accountBalance}
}

module.exports = {
    getAmountsDataByCreatorIdAndFilteringOption,
    createAmountByValuesReturnAmountCreatedAndAccountBalance,
    deleteAmountByIdAndCreatorIdReturnAmountAndAccountBalance,
    deleteAllAmountsOfCreatorByCreatorIdReturnAmountsAndAccountBalance,
    updateAmountByIdCreatorIdAndNewValuesReturnAmountAndAccountBalance,
}