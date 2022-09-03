
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
    
    const creatorId = req.user.id

    try {
        // check if type is default or custom
        const filter = {movement:movement, name:type}
        const typeMatched = await getTypesByFilter(filter)
        if(!typeMatched){
            return res.status(400).send('The type and movement are not stored')
        } else if (typeMatched.default===false && typeMatched.creator !== creatorId) {
            return res.status(400).send(`No type created with movement ${filter.movement} and name ${filter.name}`)
        }
        else {
            type = typeMatched.id
        }
    } catch(error){
        res.status(400).json('Cant create Amount')
    }

    const amount = {quantity:quantity,type:type,creator:creatorId}

    try {
        const result = await storeAmount(amount)
        res.status(201).send({User : req.user.email, AmountCreated : result})
    } catch (error) {
        res.status(400).send('Cant create Amount')
    }
}

const deleteAmount = async (req,res) => {
    const {id:id} = req.params
    if(!id) return res.status(400).send('Please provide id')
     
    const amount = await getAmountById(id)
    if(!amount) {
        return res.status(404).send('Amount not found, can not delete Amount')
    }

    try {
        const result = await deleteAmountById(id)
        res.status(200).send({User : req.user.email , AmountDeleted : result})
    } catch (error) {
        console.log(error)
        res.status(400).json('Cant delete Amount')
    }
}

const updateAmount = async (req,res) => {
    const {id:id} = req.params
    const {
        quantity:quantity,
        movement:movement,
        name:name
    } = req.body
    const creator = req.user.id
    if(!id || !quantity || !movement || !name) return res.status(404).send('Please provide id, quantity, movement and name')
    // check if the name and movement exist
    try {
        const filter = {movement:movement, name:name}
        const typeMatched = await getTypesByFilter(filter)

    } catch (error) {
        
    }
    res.status(200).json({id, quantity, movement, name})
}

module.exports = {
    getAmounts,
    createAmount,
    deleteAmount,
    updateAmount
}