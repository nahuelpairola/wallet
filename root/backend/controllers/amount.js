const {StatusCodes} = require('http-status-codes')

const { getAmountsDataByCreatorIdAndFilteringOption,
    createAmountByValuesReturnAmountCreatedAndAccountBalance,
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

    const {amount,accountBalance} = await createAmountByValuesReturnAmountCreatedAndAccountBalance({
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
        join:join, // join types or join movements
        page:page,
        limit:limit,
    } = req.query
    const creator = req.user
    const filteringOption = {}
    if(quantity) filteringOption.quantity = quantity
    if(movement) filteringOption.movement = movement
    if(type) filteringOption.type = type
    if(created_at) filteringOption.created_at = created_at
    if(join) filteringOption.join = join 
    if(page) filteringOption.page = page
    if(limit) filteringOption.limit = limit
    const data = await getAmountsDataByCreatorIdAndFilteringOption({
        creatorId:creator.id,
        filteringOption
    })
    res.status(StatusCodes.OK).json({
        user:{id:creator.id,email:creator.email},
        accountBalance:data.accountBalance,
        pagination:data.pagination,
        data:data.amounts,
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