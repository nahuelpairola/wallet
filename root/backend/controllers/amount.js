
const { getAmountsByFilter,
        getAmountById,
        storeAmount,
        deleteAmountById,
    } = require('../services/amount')

const {getTypesByFilter, getTypeById,
    } = require('../services/type')

const getAmounts = async (req,res) => {
    const {
        quantity:quantity,
        created_at:created_at,
        movement:movement,
    } = req.query

    let {
        type:type,
    } = req.query

    const creator = req.user // add user id to filter obj

    const filter = {}
    filter.creator = creator.id

    if(movement){
        filter.movement = movement
    }
    if(quantity){
        filter.quantity = quantity
    }
    if(created_at){
        filter.created_at = created_at
    }
    if(type){
        try {
            const typeMatched = await getTypeById(type)
            if(!typeMatched){
                res.status(400).send('The type and movement are not stored')
            }
            else {
                filter.type = typeMatched
            }
        } catch (error) {
            res.status(400).send('Cant create Amount')
        }
    }
    try {
        const amounts = await getAmountsByFilter(filter)
        res.status(200).send({Hits: amounts.length,User: req.user.email, Amounts: amounts})
    } catch (error) {
        res.status(400).send('Cant get Amounts')
    }
}

const createAmount = async (req,res) => {
    const {
        quantity:quantity,
        movement:movement,
    } = req.body
    let {
        type:type,
    } = req.body

    if(!quantity || !movement || !type) {
        res.status(400).send('Please provide all data')
    }
    
    const creator = req.user

    try {
        // check if type is default or custom
        const filter = {creator:creator.id, movement:movement, name:type}
        const typeMatched = await getTypesByFilter(filter)
        console.log('TYPEMaTCHED', typeMatched);
        if(!typeMatched){
            res.status(400).send('The type and movement are not stored A')
        } else {
            type = typeMatched.id
        }
    } catch(error){
        res.status(400).json('Cant create Amount')
    }

    const amount = {quantity:quantity,type:type,creator:creator.id}

    try {
        const result = await storeAmount(amount)
        res.status(201).send({User : req.user.email, AmountCreated : result})
    } catch (error) {
        res.status(400).send('Cant create Amount')
    }
}

const deleteAmount = async (req,res) => {
    const {id:id} = req.params

    const amount = await getAmountById(id)

    if(!amount) {
        res.status(404).send('Cant delete Amount, Amount not found')
    }

    try {
        const result = await deleteAmountById(id)
        res.status(200).send({User : req.user.email,AmountDeleted : result})
    } catch (error) {
        console.log(error)
        res.status(400).json('Cant delete Amount')
    }
}

const updateAmount = async (req,res) => {
    res.status(200).send('UPDATE IN PROCESS')
}

module.exports = {
    getAmounts,
    createAmount,
    deleteAmount,
    updateAmount
}