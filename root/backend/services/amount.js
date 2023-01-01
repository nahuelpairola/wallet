
const { ServiceError} = require('../errors')
const { 
    AmountSearchError,
    AmountCreateError,
    AmountDeleteError,
    AmountUpdateError
} = require('../errors/amount-errors')
const {
    NOT_ENOUGH_DATA,
    TYPE_NOT_FOUND,
    AMOUNT_NOT_FOUND, 
    AMOUNT_UPDATING_ERROR,
    AMOUNT_DELETING_ERROR
} = require('../errors/error-msg-list')

const repository = require('../repository/amount')
const typeServices = require('./type')
const userServices = require('./usersTypesAndAmounts')

const getByCreatorIdAndFilteringOption = async ({ creatorId, filteringOption}) => {
    if(!creatorId) throw new AmountSearchError(NOT_ENOUGH_DATA)
    let result = await repository.getByFilter({creatorId, filteringOption})
    const accountBalance = await userServices.getAccountBalanceById(creatorId)
    return {
        pagination:result.pagination,
        amounts:result.amounts,
        accountBalance
    }
}

const create = async ({quantity,movement,type,creator,created_at}) => {
    if( !quantity || !movement || !type || !creator ) throw new AmountCreateError(NOT_ENOUGH_DATA)
    // check if the type (movement and name) is a default one or its a custom one and belongs to the user
    const typeToUse = await typeServices.getByCreatorMovementAndName(creator,movement,type)
    if(!typeToUse) throw new AmountCreateError(TYPE_NOT_FOUND)
    const amountToCreate = {
        quantity,
        amountType: typeToUse.id,
        creator,
    }
    if(created_at) amountToCreate.created_at = new Date(created_at)
    else amountToCreate.created_at = new Date()
    const amount = await repository.create(amountToCreate)
    await userServices.calculateAccountBalanceByIdAndNewAmount(creator,amount)
    return amount
}

const deleteByIdAndCreatorId = async ({id,creatorId}) => {
    if(!id || !creatorId) throw new AmountDeleteError(NOT_ENOUGH_DATA)
    const amountDeleted = await repository.deleteByIdAndCreator(id,creatorId)
    if(!amountDeleted) throw new AmountDeleteError(AMOUNT_DELETING_ERROR)
    await userServices.calculateAccountBalanceByIdAndDeletedAmount(creatorId,amountDeleted)
    return
}

const updateByIdCreatorAndValues = async ({id,creator,values}) => {
    if( !id || !creator || !values.quantity || !values.movement || !values.type) throw new ServiceError(NOT_ENOUGH_DATA)
    const newType = await typeServices.getByCreatorMovementAndName(creator,values.movement,values.type)
    if(!newType) throw new AmountUpdateError(TYPE_NOT_FOUND)
    const amountToUpdate = await repository.getByIdAndCreator({id,creator})
    if(!amountToUpdate) throw new AmountUpdateError(AMOUNT_NOT_FOUND)
    const amountUpdated = await repository.updateAmountByIdCreatorAndValues({id,creator,values:{quantity:values.quantity,amountType:newType.id}})
    if(!amountUpdated) throw new AmountUpdateError(AMOUNT_UPDATING_ERROR)
    await userServices.calculateAccountBalanceByIdAndUpdatedAmount(creator,amountToUpdate,amountUpdated)
    return amountUpdated
}

const deleteAllByCreator = async (creator) => {
    if(!creator) throw new AmountDeleteError(NOT_ENOUGH_DATA)
    await userServices.resetAccountBalanceById(creator)
    return await repository.deleteAllByCreator(creator)
}

module.exports = {
    getByCreatorIdAndFilteringOption,
    create,
    deleteByIdAndCreatorId,
    deleteAllByCreator,
    updateByIdCreatorAndValues,
}