const {StatusCodes} = require('http-status-codes')

const { getAmountsByCreatorIdWithFilteringOption,
        createAmountByQuantityMovementTypeAndCreatorId,
        deleteAmountByIdAndCreatorId,
        updateAmountByIdCreatorIdAndNewValues,
    } = require('../services/amount')
    
const createAmount = async (req,res) => {
    const {
        quantity:quantity,
        movement:movement,
        type:type,
    } = req.body
    const creator = req.user

    const amountCreated = await createAmountByQuantityMovementTypeAndCreatorId({
        quantity: quantity,
        movement: movement,
        type: type,
        creatorId: creator.id
    })
    res.status(StatusCodes.CREATED).json({ user:{id:creator.id,email:creator.email}, amountCreated: amountCreated, msg: "AMOUNT CREATED SUCCESSFUL"})
}

const getAmounts = async (req,res) => {
    const {
        quantity:quantity,
        created_at:created_at,
        movement:movement,
        type:type,
    } = req.query
    const creator = req.user
    const filteringOption = {}
    if(quantity) filteringOption.quantity = quantity
    if(movement) filteringOption.movement = movement
    if(type) filteringOption.type = type
    if(created_at) filteringOption.created_at = created_at
    const amounts = await getAmountsByCreatorIdWithFilteringOption({creatorId:creator.id,filteringOption})
    res.status(StatusCodes.OK).json({user: {id:creator.id,email:creator.email}, nAmounts: amounts.length, amounts: amounts, msg: "AMOUNTS SEARCHING SUCCESSFUL"})
}

const deleteAmount = async (req,res) => {
    const {id:amountId} = req.params
    const creator = req.user
    const amountDeleted = await deleteAmountByIdAndCreatorId({amountId, creatorId:creator.id})
   res.status(StatusCodes.OK).json({ user: {id:creator.id,email:creator.email}, amountDeleted: amountDeleted, msg: "AMOUNT DELETED SUCCESSFUL"})
}

const updateAmount = async (req,res) => {
    const {id:amountId} = req.params
    const {quantity:quantity, movement:movement, type:type} = req.body
    const creator = req.user
    const amountUpdated = await updateAmountByIdCreatorIdAndNewValues({
        amountId: amountId,
        creatorId: creator.id,
        newValues: {quantity, movement, type}
    })
    res.status(StatusCodes.OK).json({user: {id:creator.id,email:creator.email}, updatedAmount: amountUpdated, msg: "AMOUNT UPDATED SUCCESSFUL"})
}

module.exports = {
    getAmounts,
    createAmount,
    deleteAmount,
    updateAmount
}