const {
    createTypeInDB,
    getTypeByIdFromDB,
    getTypesByFilterFromDB,
    getTypesByCreatorIdFromDB,
    deleteTypeByIdInDB,
    updateNameAndMovementInTypeByIdInDB,
} = require('../repository/type')

const {
    NOT_ENOUGH_DATA,
    TYPE_DELETING_ERROR,
} = require('../errors/error-msg-list')

const { ServiceError } = require('../errors')

const createNewType = async (newType) => {
    if (!newType.movement ||
        !newType.name ||
        !newType.creator ||
        typeof newType.default === 'undefined') throw new ServiceError(NOT_ENOUGH_DATA)

    const typeToCreate = { // type to create
        movement: newType.movement,
        name: newType.name,
        creator: newType.creator,
        default: newType.default,
        created_at: new Date()
    }
    // check if there is not a default type with same name and movement
    const typeByDefaultMatched = await getTypesByFilterFromDB({movement:newType.movement,name:newType.name,default:true})
    if (!typeByDefaultMatched) { // if theres not default type matched
        if (newType.default) { 
            const storedDefaultType = await createTypeInDB(typeToCreate) // if the type to create is a default one, create it
            return storedDefaultType // returns new type by default
        } else { // new type is a custom one
            // check if that user has not a custom type with the same values
            const customType = await getTypesByFilterFromDB({
                movement: newType.movement,
                name: newType.name,
                creator: newType.creator,
                default: false
            })
            if (!customType) { // if not exists, create a new custom type
                const storedCustomType = await createTypeInDB(typeToCreate)
                return storedCustomType
            } else return customType
        }
    } else { 
        return typeByDefaultMatched
    }
}

const getTypesByFilter = async (values) => {
    const filter = {}
    if (values.movement) filter.movement = values.movement
    if (values.name) filter.name = values.name
    if (typeof values.default !== 'undefined') filter.default = values.default
    if (values.creator) filter.creator = values.creator
    const types = await getTypesByFilterFromDB(filter)
    if (types) return types
    else return null
}

const getTypesByCreatorId = async (userId) => { // id: crerator id
    if (!userId) throw new ServiceError(NOT_ENOUGH_DATA)
    const types = await getTypesByCreatorIdFromDB(userId)
    if (types) return types
    else return null
}

const getTypeById = async (id) => {
    // the type can be a default or a custom one
    if (!id) throw new ServiceError(NOT_ENOUGH_DATA)
    const type = await getTypeByIdFromDB(id)
    if (type) return type
    else return null
}

const deleteTypeById = async (id) => {
    if (!id) throw new ServiceError(NOT_ENOUGH_DATA)
    const typeToDelete = await getTypeByIdFromDB(id) // check if the type is not a default type
    if (typeToDelete) {
        const deletedType = await deleteTypeByIdInDB(id)
        return deletedType
    } else {
        throw new ServiceError(TYPE_DELETING_ERROR)
    }
}

const updateMovementAndNameInTypeById = async (values) => {
    if (!values.id || !values.movement || !values.name) throw new ServiceError(NOT_ENOUGH_DATA)
    const typeMatched = await getTypeByIdFromDB(values.id)
    if (typeMatched) {
        const typeUpdated = await updateNameAndMovementInTypeByIdInDB({
            id:values.id,
            movement:values.movement,
            name:values.name
        })
        return typeUpdated
    } else {
        return null
    }
}

module.exports = {
    createNewType,
    getTypeById,
    getTypesByFilter,
    getTypesByCreatorId,
    deleteTypeById,
    updateMovementAndNameInTypeById,
}
