const {StatusCodes} = require('http-status-codes')

const { getAmountsByFilter,
        getAmountById,
        storeAmount,
        deleteAmountById,
        updateAmountById,
    } = require('../services/amount')

const {getTypesByFilter,
    } = require('../services/type')

const getAmounts = async (req,res) => {
    const {
        quantity:quantity,
        created_at:created_at,
        movement:movement,
        type:type,
    } = req.query

    const creator = req.user // add user id to filter obj

    const filter = {}
    filter.creator = creator.id

    if(quantity) filter.quantity = quantity
    if(created_at) filter.created_at = created_at
    if(movement) filter.movement = movement
    if(type) filter.type = type
    try {
        const amounts = await getAmountsByFilter(filter)
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
        res.status(StatusCodes.BAD_REQUEST).json({msg:'Please provide all data'})
    }
    
    const creatorId = req.user.id
    let typeId = null

    try {
        // check if type is default or custom
        const filter = {movement:movement, name:typeName}
        const typeMatched = await getTypesByFilter(filter)
        if(!typeMatched || typeMatched.default===false && typeMatched.creator !== creatorId){
            return res.status(StatusCodes.NOT_FOUND).json({msg:'Type not found'})
        } else {
            typeId = typeMatched.id
        }
    } catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Cant create Amount'})
    }

    const newAmount = {quantity:quantity,type:typeId,creator:creatorId}

    try {
        const amountCreated = await storeAmount(newAmount)
        if(!amountCreated) res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Cant create Amount'})
        else res.status(StatusCodes.CREATED).send({
            User:req.user.email,
            AmountCreated:result
        })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Cant create Amount'})
    }
}

const deleteAmount = async (req,res) => {
    const {id:id} = req.params
    
    try {
        const amount = await getAmountById(id)
        if(!amount) {
            return res.status(StatusCodes.NOT_FOUND).json({msg:'Amount not found'})
        }
    } catch(error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Internal Server Error'})
    }

    try {
        const amountDeleted = await deleteAmountById(id)
        res.status(StatusCodes.OK).json({
            User:req.user.email,
            AmountDeleted:amountDeleted
        })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Internal Server Error'})
    }
}

const updateAmount = async (req,res) => {
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