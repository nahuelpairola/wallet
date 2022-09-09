
const { NOT_ENOUGH_DATA, TYPE_SEARCHING_ERROR, TYPE_CREATION_ERROR, TYPE_DELETING_ERROR, TYPE_UPDATING_ERROR } = require('../errors/error-msg-list')
const {
    createTypeInDB,
    getTypeByIdFromDB,
    getTypesByFilterFromDB,
    getTypesByCreatorIdFromDB,
    deleteTypeByIdInDB,
    updateTypeByIdInDB,
} = require('../repository/type')

const storeType = async (values) => {
    if(!values.movement || 
        !values.name || 
        !values.creator || 
        typeof values.default === 'undefined') {
        throw new Error(NOT_ENOUGH_DATA)
    }
    const type = { // type to create
        movement: values.movement,
        name: values.name,
        creator: values.creator,
        default: values.default,
        created_at: new Date()
    }
    // check if there is not a default type with same name and movement
    try {
        const typeByDefaultMatched = await getTypesByFilterFromDB({
            movement:values.movement,
            name:values.name,
            default:true
        })
        if(!typeByDefaultMatched) {
            if(values.default === true) {
                // create new default type default
                try {
                    const storedDefaultType = await createTypeInDB(type)
                    return storedDefaultType
                } catch(error) {
                    throw new Error(TYPE_CREATION_ERROR)
                }
            } else if (values.default === false) {
                // check if that user has not a custom type with the same values
                try {
                    const customType = await getTypesByFilterFromDB({
                        movement:values.movement,
                        name:values.name,
                        creator:values.creator,
                        default:false 
                    })
                    if(!customType) { // if not exists, create a new custom type
                        try {
                            const storedCustomType = await createTypeInDB(type)
                            return storedCustomType
                        } catch(error) {
                            throw new Error(TYPE_CREATION_ERROR)
                        }
                    } else {
                        return customType
                    }
                } catch(error){
                    throw new Error(TYPE_SEARCHING_ERROR)
                }
            }
        }
        if(typeByDefaultMatched){
            return typeByDefaultMatched
        }
    } catch(error) {
        throw new Error(TYPE_SEARCHING_ERROR)
    }
    return null
}

const getTypesByFilter = async (values) => {
    const filter = {}
    if(values.movement) filter.movement = values.movement
    if(values.name) filter.name = values.name
    if(typeof values.default !== 'undefined') filter.default = values.default
    if(values.creator) filter.creator = values.creator

    try {
        const types = await getTypesByFilterFromDB(filter)
        if(types) return types
        return null
    } catch (error) {
        throw new Error(TYPE_SEARCHING_ERROR)
    }
}

const getTypesByCreatorId = async (userId) => { // id: crerator id
    if(!userId) throw new Error(NOT_ENOUGH_DATA)
    try { 
        const types = await getTypesByCreatorIdFromDB(userId)
        if(types) return types
        else return null
    } catch (error) {
        throw new Error(TYPE_SEARCHING_ERROR)
    }
}

const getTypeById = async (id) => {
    // the type can be a default or a custom one (this one must be of the creator)
    if(!id) throw new Errror(NOT_ENOUGH_DATA)
    try {
        const type = await getTypeByIdFromDB(id)
        if(type) return type
        else return null
    } catch(error) {
        throw new Error(TYPE_SEARCHING_ERROR)
    }
}

const deleteTypeById = async (id) => {
    if(!id) throw new Error(NOT_ENOUGH_DATA)
    const typeToDelete = await getTypeByIdFromDB(id) // check if the type is not a default type
    if(typeToDelete) {
        try {
            const deletedType = await deleteTypeByIdInDB(id)
            return deletedType
        } catch (error) {
            throw new Error(TYPE_DELETING_ERROR)
        }
    } else {
        return null
    }
}

const updateTypeById = async (values) => {
    if(!values.id || !values.movement || !values.name) throw new Error(NOT_ENOUGH_DATA)
    try {
        const typeMatched = await getTypeByIdFromDB(values.id)
        if(typeMatched) {
            const result = await updateTypeByIdInDB({id:values.id, movement:values.movement, name:values.name})
            return result
        } else {
            return null
        }
    } catch (error) {
        throw new Error(TYPE_UPDATING_ERROR)
    }
}

module.exports = {
    storeType,
    getTypeById,
    getTypesByFilter,
    getTypesByCreatorId,
    deleteTypeById,
    updateTypeById,
}
