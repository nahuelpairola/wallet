const {StatusCodes} = require('http-status-codes')

const { getAmountsAccountBalanceAndPageByCreatorIdWithFilteringOption,
        createAmountByQuantityMovementTypeCreatedAtAndCreatorIdReturnAmountCreatedAndAccountBalance,
        deleteAmountByIdAndCreatorIdReturnAmountAndAccountBalance,
        updateAmountByIdCreatorIdAndNewValuesReturnAmountAndAccountBalance,
    } = require('../services/amount')
    
const createAmount = async (req,res) => {
    const {
        quantity:quantity,
        movement:movement,
        type:type,
        created_at: created_at
    } = req.body
    const creator = req.user

    const {amount,accountBalance} = await createAmountByQuantityMovementTypeCreatedAtAndCreatorIdReturnAmountCreatedAndAccountBalance({
        quantity: quantity,
        movement: movement,
        type: type,
        creatorId: creator.id,
        created_at: created_at
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
        page:page,
        operation:operation // join types or join movements
    } = req.query
    const creator = req.user
    const filteringOption = {}
    if(quantity) filteringOption.quantity = quantity
    if(movement) filteringOption.movement = movement
    if(type) filteringOption.type = type
    if(created_at) filteringOption.created_at = created_at
    if(operation) filteringOption.operation = operation
    if(page) filteringOption.page = page
    const {amounts, accountBalance, page:{actual,total},totalAmounts} = await getAmountsAccountBalanceAndPageByCreatorIdWithFilteringOption({
        creatorId:creator.id,
        filteringOption
    })
    res.status(StatusCodes.OK).json({
        user:{id:creator.id,email:creator.email},
        accountBalance:accountBalance,
        page:{actual:actual,nPages:total},
        nAmounts: {actual:amounts.length,total:totalAmounts},
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