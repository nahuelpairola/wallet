
const {
    NOT_ENOUGH_DATA,
    TYPE_DELETING_ERROR,
    TYPE_NOT_FOUND,
    PROVIDE_CORRECT_DATA,
    ACCESS_UNAUTHORIZED,
    TYPE_USED_IN_AMOUNT,
} = require('../errors/error-msg-list')
const { ServiceError } = require('../errors')
const {
    TypeDeleteError,
    TypeCreateError, 
    TypeSearchError, 
    TypeUpdateError
} = require('../errors/type-errors')

const {
    createTypeInDB,
    getTypeByIdFromDB,
    getTypesByFilterFromDB,
    deleteTypeByIdInDB,
    updateNameAndMovementInTypeByIdInDB,
    isMovement
} = require('../repository/type')

const { isAnAmountUsingThisTypeId } = require('./amount')

const { isUserAnAdmin } = require('./user')

const deleteCreatorOfEachType = (types) => {
    if(types.length>1) {
        const typesWithoutCreator = types.map((type)=>{
            delete type.creator
            return type
        })
        return typesWithoutCreator
    } else {
        delete types.creator
        return types
    }
}

const isTypeIdUsedInAmounts = async (typeId) => {
    const isTheTypeUsed = await isAnAmountUsingThisTypeId(typeId)
    if(isTheTypeUsed) return Promise.resolve(true)
    else return Promise.resolve(false)
}

const createNewType = async (newType) => {
    if (!newType.movement ||
        !newType.name ||
        !newType.creator ||
        typeof newType.default === 'undefined') throw new TypeCreateError(NOT_ENOUGH_DATA)
    if(!isMovement(newType.movement)) throw new TypeCreateError(PROVIDE_CORRECT_DATA)
        
    const typeToCreate = { // type to create
        movement: newType.movement,
        name: newType.name,
        creator: newType.creator,
        default: newType.default,
        created_at: new Date()
    }
    // check if there is not a default type with same name and movement
    const typeByDefaultMatched = await getTypesByFilter({
        movement:typeToCreate.movement,
        name:typeToCreate.name,
        default:true})
    if (!typeByDefaultMatched) { // if theres not default type matched
        if (newType.default) { 
            const createdDefaultType = await createTypeInDB(typeToCreate) // if the type to create is a default one, create it
            return (deleteCreatorOfEachType(createdDefaultType)) // returns new type by default
        } else { // new type should be a custom one
            // check if the user has not a custom type with the same values
            const customTypeMatched = await getTypesByFilter({
                movement: typeToCreate.movement,
                name: typeToCreate.name,
                creator: typeToCreate.creator,
                default: false
            })
            if (!customTypeMatched) { // if not exists, create a new custom type
                const storedCustomType = await createTypeInDB(typeToCreate)
                return (deleteCreatorOfEachType(storedCustomType))
            } else return deleteCreatorOfEachType(customTypeMatched)
        }
    } else return deleteCreatorOfEachType(typeByDefaultMatched)
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

const getDefaultTypes = async () => {
    const defaultTypes = await getTypesByFilterFromDB({default: true})
    if(!defaultTypes) return null
    else return defaultTypes
}

const getCustomTypesByCreatorId = async (creatorId) => {
    if(!creatorId) throw new TypeSearchError(NOT_ENOUGH_DATA)
    const customTypes = await getTypesByFilter({creator:creatorId,default:false})
    if(customTypes) return customTypes
    else return null
}

const getDefaultAndCustomTypesByUserId = async (userId) => {
    // return default and custom types by user id
    if(!userId) throw new TypeSearchError(NOT_ENOUGH_DATA)
    let userTypes = []
    const defaultTypes = await getDefaultTypes()
    if(defaultTypes) userTypes = [...defaultTypes]
    const customTypes = await getCustomTypesByCreatorId(userId)
    if(customTypes && customTypes.length>1) userTypes = [...userTypes, ...customTypes]
    else userTypes = [...userTypes, customTypes]
    return userTypes
}

const getTypesByUserIdAndRole = async (user) => {
    if(!user.id || !user.role) throw new TypeSearchError(NOT_ENOUGH_DATA)
    if(isUserAnAdmin(user)) { 
        // return only default types, no matter creator
        const defaultTypes = await getDefaultTypes()
        if(defaultTypes) {
            const defaultTypesWithoutCreator = deleteCreatorOfEachType(defaultTypes)
            return defaultTypesWithoutCreator
        }
        else return null
    } else { // user is not admin
        // return default and custom types of that user
        const defaultAndCustomTypes = await getDefaultAndCustomTypesByUserId(user.id)
        if(defaultAndCustomTypes) {
            const defaultAndCustomTypesWithoutCreator = deleteCreatorOfEachType(defaultAndCustomTypes)
            return defaultAndCustomTypesWithoutCreator
        }
        else return null
    }  
}

const getTypeById = async (id) => {
    // the type can be a default or a custom one
    if (!id) throw new TypeSearchError(NOT_ENOUGH_DATA)
    const type = await getTypeByIdFromDB(id)
    if (type) return type
    else return null
}

const getTypesByMovementNameAndUserId = async ({movement, name, userId}) => {
    if(!movement || !name || !userId) throw new TypeSearchError(NOT_ENOUGH_DATA)
    const typesMatched = await getDefaultAndCustomTypesByUserId(userId)
    const typesMatchedFiltered = typesMatched.filter((type) => ((type.movement === movement) && (type.name === name)))
    if(typesMatchedFiltered.length === 0) return null
    else return typesMatchedFiltered[0]
}

const deleteTypeById = async (id) => {
    if (!id) throw new TypeDeleteError(NOT_ENOUGH_DATA)
    const typeToDelete = await getTypeById(id)
    if (typeToDelete) {
        const deletedType = await deleteTypeByIdInDB(id)
        return deletedType
    } else throw new TypeDeleteError(TYPE_DELETING_ERROR)
}

const deleteTypeByIdAndCreator = async ({typeId:typeIdToDelete,creator:creator}) => {
    if(!typeIdToDelete || !creator.id || !creator.role) throw new TypeDeleteError(NOT_ENOUGH_DATA)

    const typeMatched = await getTypeById(typeIdToDelete)
    if(!typeMatched) return null // type not founded
    if(isTypeIdUsedInAmounts(typeIdToDelete)) throw new TypeDeleteError(TYPE_USED_IN_AMOUNT)
    
    if(isUserAnAdmin(creator) && typeMatched.default) { // if the type is default and the user is admin, delete type
        // check if the type is used in amounts
        const deletedDefaultType = await deleteTypeById(typeIdToDelete)
        return deleteCreatorOfEachType(deletedDefaultType)
    } else if(!isUserAnAdmin(creator) && typeMatched.creator === creator.id) { // if user is a normal user and is the creator of the type, delete it
        const deletedCustomType = await deleteTypeById(typeIdToDelete)
        return deleteCreatorOfEachType(deletedCustomType)
    } else if (!isUserAnAdmin(creator) && typeMatched.creator !== creator.id) { // if user is a normal user and the type is not from that creator
        throw new TypeDeleteError(ACCESS_UNAUTHORIZED)
    } else {
        throw new TypeDeleteError(TYPE_DELETING_ERROR)
    }
}

const updateMovementAndNameInTypeById = async ({id:typeId,name:newName,movement:newMovement}) => {
    if (!typeId || !newMovement || !newName) throw new TypeUpdateError(NOT_ENOUGH_DATA)
    const typeMatched = await getTypeById(typeId)
    if (typeMatched) {
        const typeUpdated = await updateNameAndMovementInTypeByIdInDB({id:typeId,movement:newMovement,name:newName})
        return typeUpdated
    } else {
        throw new TypeUpdateError(TYPE_NOT_FOUND)
    }
}

const updateTypeByIdAndUser = async ({id:typeIdToUpdate,name:newName,movement:newMovement,user}) => {
    if( !typeIdToUpdate || !newName || !newMovement || !user.id || !user.role) throw new TypeUpdateError(NOT_ENOUGH_DATA)
    // check if there is a default type with those new values
    const matchedDefaultType = await getTypesByFilter({default:true, name: newName, movement: newMovement})
    if(matchedDefaultType) return deleteCreatorOfEachType(matchedDefaultType)
    // get the type to update from id
    const matchedType = await getTypeById(typeIdToUpdate)
    if(!matchedType) throw new TypeUpdateError(TYPE_NOT_FOUND)
    if(matchedType.default && isUserAnAdmin(user)) { // check if type creator is admin and the type is a default one
        const updatedDefaultType = await updateMovementAndNameInTypeById({id:typeIdToUpdate,name:newName,movement:newMovement})
        return deleteCreatorOfEachType(updatedDefaultType)
    } else if(!matchedType.default && matchedType.creator === user.id) { // check if the type is not a default and the creator 
        const updatedCustomType = await updateMovementAndNameInTypeById({id:typeIdToUpdate,name:newName,movement:newMovement})
        return deleteCreatorOfEachType(updatedCustomType)
    }
}

const assignDefaultTypeByCreatorRole = (creatorRole) => {
    if(!creatorRole) throw new ServiceError(NOT_ENOUGH_DATA)
    if(creatorRole === 'admin') return true // the default field of the type will be true
    else return false // the type will be custom
}

module.exports = {
    createNewType, // create new type 
    getTypesByUserIdAndRole, // get types by user id and role
    getTypesByMovementNameAndUserId,
    deleteTypeByIdAndCreator, // delete a type
    updateTypeByIdAndUser, // update a type
    assignDefaultTypeByCreatorRole, // assign default element of type
    isMovement, // check if string is a movement
}
