const {StatusCodes} = require('http-status-codes')

const { getAmountsByCreatorIdWithFilteringOption,
        createAmountByQuantityMovementTypeAndCreatorId,
        deleteAmountByIdAndCreatorId,
        updateAmountByIdCreatorIdAndNewValues,
    } = require('../services/amount')

const {isMovement} = require('../services/type')

const {BadRequestError} = require('../errors')
const { PROVIDE_ALL_DATA, PROVIDE_CORRECT_DATA } = require('../errors/error-msg-list')
    
const createAmount = async (req,res) => {
    const {
        quantity:quantity,
        movement:movement,
        type:type,
    } = req.body

    if(!quantity || !movement || !type) throw new BadRequestError(PROVIDE_ALL_DATA)
    if(!isMovement(movement)) throw new BadRequestError(PROVIDE_CORRECT_DATA)
    
    const creator = req.user

    const amountCreated = await createAmountByQuantityMovementTypeAndCreatorId({
        quantity: quantity,
        movement: movement,
        type: type,
        creatorId: creator.id
    })
    res.status(StatusCodes.CREATED).json({ User: creator.email, AmountCreated: amountCreated })
}

const getAmounts = async (req,res) => {
    const {
        quantity:quantity,
        created_at:created_at,
        movement:movement,
        type:type,
    } = req.query

    const creator = req.user // add user id to filter obj

    const filteringOption = {}
    if(quantity) filteringOption.quantity = quantity
    if(movement) filteringOption.movement = movement
    if(type) filteringOption.type = type
    if(created_at) filteringOption.created_at = created_at
    
    const amounts = await getAmountsByCreatorIdWithFilteringOption({creatorId:creator.id,filteringOption})
    res.status(StatusCodes.OK).json({User: req.user.email, nAmounts: amounts.length, Amounts: amounts})
}

const deleteAmount = async (req,res) => {
    const {id:amountId} = req.params
    if(!amountId) throw new BadRequestError(PROVIDE_ALL_DATA)
    const creator = req.user
    const amountDeleted = await deleteAmountByIdAndCreatorId({amountId, creatorId:creator.id})
   res.status(StatusCodes.OK).json({ User: creator.email, AmountDeleted: amountDeleted})
}

const updateAmount = async (req,res) => {
    const {id:amountId} = req.params
    const {quantity:quantity, movement:movement, type:type} = req.body
    if(!amountId || !quantity || !movement || !type) throw new BadRequestError(PROVIDE_ALL_DATA)
    
    const creator = req.user
    const amountUpdated = await updateAmountByIdCreatorIdAndNewValues({
        amountId: amountId,
        creatorId: creator.id,
        newValues: {quantity, movement, type}
    })
    res.status(StatusCodes.OK).json({User: req.user.email, UpdatedAmount: amountUpdated})
}

module.exports = {
    getAmounts,
    createAmount,
    deleteAmount,
    updateAmount
}