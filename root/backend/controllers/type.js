
const { getTypeIdByName, 
        getTypesByCreator, 
        storeType,
        deleteTypeById,
        updateTypeById,
        getTypeById,
    } = require('../services/type')

const getTypes = async (req,res) => {
    const creator = req.user
    try {
        const types = await getTypesByCreator(creator)
        res.status(200).send({ nHits: types.length, User: req.user.email, Types: types })
    } catch (error) {
        console.log(error)
        res.status(400).send('Error to get the data')
    }
}

const createType = async (req, res) => {
    const {
        movement: movement,
        name: name,
    } = req.body

    if(!movement || !name) {
        res.status(400).send('Please provide all data')
    }
    
    const creator = req.user
    const type = {name: name, movement: movement, creator: creator}
    try {
        const result = await storeType(type)
        res.status(201).send({User: creator.email, CreatedType: result})
    } catch (error) {
        res.status(400).json({msg: 'Cant create Amount'})
    }
}

const updateType = async (req, res) => {
    const {id} = req.params
    const {name:name, movement:movement} = req.body
    if(!id || !name) {
        res.status(400).json({msg: 'Please provide id and name'})
    }
    const values = {id:id, name:name, movement:movement}
    try {
        const updatedType = await updateTypeById(values)
        res.status(200).send({User: req.user.email, UpdatedType: updatedType})
    } catch (error) {
        res.status(400).send('Error to get the data')
    }
}

const deleteType = async (req,res) => {
    const {id:id} = req.params
    if(!id) {
        res.status(400).json({msg: 'Please provide id'})
    }
    const filter = {creator:req.user, id:id}
    try {
        const deletedType = await deleteTypeById(filter)
        res.status(200).send({User: req.user.email, DeletedType: deletedType})
    } catch (error) {
        res.status(400).send('Error to delete the data')
    }
}

module.exports = {
    getTypes,
    createType,
    deleteType,
    updateType,
}