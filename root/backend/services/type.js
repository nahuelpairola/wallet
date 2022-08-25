
const {
    createTypeInDB,
    getTypeByIdFromDB,
    getTypesByFilterFromDB,
    getTypesByCreatorIdFromDB,
    deleteTypeByIdInDB,
    updateTypeByIdInDB,
} = require('../repository/type')

const storeType = async (values) => {
    if(!values.movement || !values.name || !values.creator) {
        return
    }
    const type = {
        movement: values.movement,
        name: values.name,
        creator: values.creator,
        default: values.default,
        created_at: new Date()
    }
    // check if there is not a default type with the same name and movement
    try {
        const typeByDefaultMatched = await getTypesByFilterFromDB({movement:values.movement,
                                                                name:values.name,
                                                                default:true })
        if(!typeByDefaultMatched && values.default) { // create new type by default
            const storedDefaultType = await createTypeInDB(type)
            return storedDefaultType
        }
        if(!typeByDefaultMatched && !values.default) {
            // check if that user has not a custom type with the same values
            const customType = await getTypesByFilterFromDB({movement:values.movement,
                                                            name:values.name,
                                                            creator:values.creator,
                                                            default:false })
            if(!customType) {
                const storedCustomType = await createTypeInDB(type)
                return storedCustomType
            } else {
                return customType
            }
        }
        if(typeByDefaultMatched){
            return typeByDefaultMatched
        }
    } catch (error) {
        console.log(error)
        return
    }
}

const getTypesByFilter = async (values) => {
    const filter = {}
    if(values.movement) filter.movement = values.movement
    if(values.name) filter.name = values.name
    if(values.default) filter.default = values.default
    if(values.creator) filter.creator = values.creator
    try {
        const types = await getTypesByFilterFromDB(filter)
        if(types) {
            console.log(types)
            return types
        }
        return
    } catch (error) {
        console.log(error)
        return
    }
}

const getTypesByCreatorId = async (id) => { // id: crerator id
    if(!id) {
        return
    }
    try { 
        const types = await getTypesByCreatorIdFromDB(id)
        return types
    } catch (error) {
        console.log(error)
        return
    }
}

const getTypeById = async (id) => {
    // the type can be a default or a custom one (this one must be of the creator)
    if(!id) {
        return
    }
    try {
        const type = await getTypeByIdFromDB(id)
        if(type){
            return type
        }
    } catch(error) {
        console.log(error)
        return
    }
    return
}

const deleteTypeById = async (id) => {
    if(!id) {
        return
    }
    const typeToDelete = await getTypeByIdFromDB(id) // check if the type is not a default type
    if(typeToDelete) { 
        try {
            const deletedType = await deleteTypeByIdInDB(id)
            return deletedType
        } catch (error) {
            console.log(error)
            return
        }
    } else {
        return
    }
}

const updateTypeById = async (values) => {
    return 'update type'
}

module.exports = {
    storeType,
    getTypeById,
    getTypesByFilter,
    getTypesByCreatorId,
    deleteTypeById,
    updateTypeById,
}
