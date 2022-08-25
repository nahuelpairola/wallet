
const {
    storeType,
    getTypeById,
    getTypesByFilter,
    getTypesByCreatorId,
    deleteTypeById,
    updateTypeById,
    } = require('../services/type')

const createType = async (req, res) => {
    const {
        movement: movement,
        name: name,
    } = req.body
    if(!movement || !name) {
        res.status(400).send('Please provide all data')
    }

    const creator = req.user
    const type = {name: name, movement: movement, creator: creator.id}

    if(creator.role === 'admin') type.default = true
    else type.default = false

    try {
        // returns the founded type or a new type
        const result = await storeType(type)
        res.status(201).send({User: creator.email, CreatedType: result})
    } catch (error) {
        res.status(400).send('Cant create Amount')
    }
}

const getTypes = async (req,res) => {
    const creator = req.user

    const filter = {}

    
    if(creator.role === 'admin') { // check if user = admin
        try { // only will return default types, all created by admin users
            filter.default = true
            const defaultTypes = await getTypesByFilter(filter)
            res.status(200).send({ nHits: defaultTypes.length, Admin: creator.email, Types: defaultTypes })
        } catch(error){
            console.log(error)
            res.status(400).send('Error to get the types by default')
        }
    } else { // creator = user
        let types = []
        try {
            filter.default = true
            const defaultTypes = await getTypesByFilter(filter)
            const customTypes = await getTypesByCreatorId(creator.id) // get custom of that admin
            if(customTypes){
                types = [...defaultTypes,...customTypes]
                res.status(200).send({ nHits: types.length, User: creator.email, Types: types })
            }
            else {
                types = [...defaultTypes]
                res.status(200).send({ nHits: types.length, User: creator.email, Types: types })
            }
        } catch(error) {
            console.log(error)
            res.status(400).send('Error to get the default and custom types')
        }
    }
}

const deleteType = async (req,res) => {
    const {id:id} = req.params
    if(!id) {
        console.log(id);
        res.status(400).send('Please verify http req (no id)')
    }
    const creator = req.user
    
    if(creator.role === 'admin') { // can only delete default types no matters creator
        try { // check if type id and creator id are in the type to delete
            const typeToDelete = await getTypeById(id)
            if(typeToDelete && typeToDelete.default) {
                const deletedType = await deleteTypeById(id)
                res.status(200).send({User: req.user.email, DeletedType: deletedType})
            } else {
                res.status(400).send('Admin : Error to delete the data : type not found or not able to delete')
            }
        } catch (error) {
            res.status(400).send('Error to delete the data')
        }
    } else { // creator = user, can ONLY delete types created by him
        const typeToDelete = await getTypeById(id)
        if(typeToDelete && !typeToDelete.default && typeToDelete.creator === creator.id) { // check if the creator is user
            const deletedType = await deleteTypeById(id)
            res.status(200).send({User: req.user.email, DeletedType: deletedType})
        } else {
            res.status(400).send('User : Error to delete the data : type not found or not able to delete')
        }
    }
}

const updateType = async (req, res) => {
    const { id: id } = req.params
    if(!id) {
        res.status(400).send('Please verify http req (no id)')
    }
    const { name: name, movement: movement } = req.body
    if(!id || !name || !movement) {
        res.status(400).send('Please provide id and name')
    }
    const values = {id:id, name:name, movement:movement}
    try {
        const updatedType = await updateTypeById(values)
        res.status(200).send({User: req.user.email, UpdatedType: updatedType})
    } catch (error) {
        res.status(400).send('Error to get the data')
    }
}

module.exports = {
    getTypes,
    createType,
    deleteType,
    updateType,
}