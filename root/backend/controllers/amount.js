const {StatusCodes} = require('http-status-codes')

const { getAmountsByFilterWithCreatorId,
        getAmountById,
        createNewAmount,
        deleteAmountById,
        updateAmountById,
    } = require('../services/amount')

const {getTypesByFilter,
    } = require('../services/type')

const {BadRequestError, NotFoundError, UnauthenticatedError} = require('../errors')
const { PROVIDE_ALL_DATA, PROVIDE_CORRECT_DATA, TYPE_NOT_FOUND, TYPE_SEARCHING_ERROR, AMOUNT_CREATION_ERROR } = require('../errors/error-msg-list')

const getAmounts = async (req,res,next) => {
    const {
        quantity:quantity,
        created_at:created_at,
        movement:movement,
        type:type,
    } = req.query

    const creator = req.user // add user id to filter obj

    const filter = {}
    if(quantity) filter.quantity = quantity
    if(created_at) filter.created_at = created_at
    if(movement) filter.movement = movement
    if(type) filter.amountType = type
    filter.creator = creator.id
    try {
        const amounts = await getAmountsByFilterWithCreatorId(filter)
        res.status(StatusCodes.OK).send({Hits: amounts.length,User: req.user.email, Amounts: amounts})
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Internal Server Error'})
    }
}

const createAmount = async (req,res) => {
    const {
        quantity:quantity,
        movement:movement,
    } = req.body
    let {
        type:typeName,
    } = req.body

    if(!quantity || !movement || !typeName) {
        throw new BadRequestError(PROVIDE_ALL_DATA)
    }

    if(movement !== 'input' && movement !== 'output') throw new BadRequestError(PROVIDE_CORRECT_DATA)
    
    const creator = req.user
    let typeId = null

    // check if type is default or custom
    const filter = {movement:movement, name:typeName}
    const typeMatched = await getTypesByFilter(filter)
    if(!typeMatched) {
        throw new NotFoundError(TYPE_NOT_FOUND)
    } 
    if (typeMatched.default===false && typeMatched.creator !== creator.id){
        throw new UnauthenticatedError(TYPE_NOT_FOUND)
    }
    typeId = typeMatched.id

    const amountToCreate = {
        quantity:quantity,
        amountType:typeId,
        creator:creator.id
    }
    const amountCreated = await createNewAmount(amountToCreate)
    const newAmount = await getAmountById(amountCreated.id)
    res.status(StatusCodes.CREATED).send({ User:req.user.email, AmountCreated: newAmount })
}

const deleteAmount = async (req,res) => {
    const {id:id} = req.params
    const amount = await getAmountById(id)
    if(!amount) return res.status(StatusCodes.NOT_FOUND).json({msg:'Amount not found'})
    
    const amountDeleted = await deleteAmountById(id)
|   res.status(StatusCodes.OK).json({ User:req.user.email, AmountDeleted:amountDeleted })
}

const updateAmount = async (req,res,next) => {
    const {id:id} = req.params
    const {
        quantity:quantity,
        movement:movement,
        name:name
    } = req.body

    const creator = req.user
    if(!quantity || !movement || !name) res.status(StatusCodes.BAD_REQUEST).send('Please provide id, quantity, movement and name')
    if(creator.role === 'admin') {
        // check if the new name and movement exist 
        try {
            const filter = {movement:movement, name:name}
            const typeMatched = await getTypesByFilter(filter)
    
        } catch (error) {
            
        }
        res.status(200).json({id, quantity, movement, name})

    }
}

module.exports = {
    getAmounts,
    createAmount,
    deleteAmount,
    updateAmount
}