const {StatusCodes} = require('http-status-codes')

const { getAmountsByCreatorIdWithFilteringOptionReturnAmountsAndAccountBalance,
        createAmountByQuantityMovementTypeAndCreatorIdReturnAmountCreatedAndAccountBalance,
        deleteAmountByIdAndCreatorIdReturnAmountAndAccountBalance,
        updateAmountByIdCreatorIdAndNewValuesReturnAmountAndAccountBalance,
    } = require('../services/amount')
    
const createAmount = async (req,res) => {
    const {
        quantity:quantity,
        movement:movement,
        type:type,
    } = req.body
    const creator = req.user

    const {amount,accountBalance} = await createAmountByQuantityMovementTypeAndCreatorIdReturnAmountCreatedAndAccountBalance({
        quantity: quantity,
        movement: movement,
        type: type,
        creatorId: creator.id
    })
    res.status(StatusCodes.CREATED).json({ 
        user:{id:creator.id,email:creator.email},
        accountBalance: accountBalance,
        amountCreated: amount,
        msg: "AMOUNT CREATED SUCCESSFUL"
    })
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
    const {amounts, accountBalance} = await getAmountsByCreatorIdWithFilteringOptionReturnAmountsAndAccountBalance({
        creatorId:creator.id,
        filteringOption
    })
    res.status(StatusCodes.OK).json({
        user:{id:creator.id,email:creator.email},
        accountBalance:accountBalance,
        nAmounts: amounts.length,
        amounts: amounts,
        msg: "AMOUNTS SEARCHING SUCCESSFUL"})
}

const deleteAmount = async (req,res) => {
    const {id:amountId} = req.params
    const creator = req.user
    const {amount,accountBalance} = await deleteAmountByIdAndCreatorIdReturnAmountAndAccountBalance({amountId, creatorId:creator.id})
    res.status(StatusCodes.OK).json({ 
        user: {id:creator.id,email:creator.email},
        accountBalance: accountBalance,
        amountDeleted: amount,
        msg: "AMOUNT DELETED SUCCESSFUL"
    })
}

const updateAmount = async (req,res) => {
    const {id:amountId} = req.params
    const {quantity:quantity, movement:movement, type:type} = req.body
    const creator = req.user
    const {amount, accountBalance} = await updateAmountByIdCreatorIdAndNewValuesReturnAmountAndAccountBalance({
        amountId: amountId,
        creatorId: creator.id,
        newValues: {quantity, movement, type}
    })
    res.status(StatusCodes.OK).json({
        user:{id:creator.id,email:creator.email},
        accountBalance: accountBalance,
        amountUpdated: amount,
        msg: "AMOUNT UPDATED SUCCESSFUL"})
}

module.exports = {
    getAmounts,
    createAmount,
    deleteAmount,
    updateAmount
}