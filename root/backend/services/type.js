
const {
    NOT_ENOUGH_DATA,
    TYPE_DELETING_ERROR,
    TYPE_NOT_FOUND,
    TYPE_USED_IN_AMOUNT,
    TYPE_ALREADY_CREATED,
    TYPE_DELETE_UNAUTHORIZED,
} = require('../errors/error-msg-list')
const { ServiceError, NotFoundError } = require('../errors')
const {
    TypeDeleteError,
    TypeCreateError, 
    TypeSearchError, 
    TypeUpdateError
} = require('../errors/type-errors')

const {
    exists,
    create,
    getByCreator,
    deleteByIdAndCreatorIfNotUsed,
    getTypesByFilterFromDB,
    updateNameAndMovementInTypeByIdInDB,
    isMovement
} = require('../repository/type')

const { isTypeIdInAmounts , isUserAnAdmin } = require('./usersTypesAndAmounts')

const deleteCreator = (types) => {
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

const createNewType = async (type) => {
    if(await exists(type)) throw new TypeCreateError(TYPE_ALREADY_CREATED)
    type.created_at = new Date() // add creted_at in type to create
    return await create(type)
}

const getTypesByCreator = async (creatorId) => {
    if(!creatorId) throw new TypeSearchError(NOT_ENOUGH_DATA)
    const types = await getByCreator(creatorId)
    if(types.length === 0) throw new TypeSearchError(TYPE_NOT_FOUND)
    return types
}

const isUsedInAmounts = async (typeId) => {
    if(await isTypeIdInAmounts(typeId)) return true
    return false
}

const deleteByIdAndCreator = async ({id,creator}) => {
    if(!id || !creator) throw new TypeDeleteError(NOT_ENOUGH_DATA)
    const result = await deleteByIdAndCreatorIfNotUsed({id,creator})
    if(result) return null
    throw new TypeDeleteError(TYPE_DELETE_UNAUTHORIZED)
}

const getByFilter = async (values) => {
    const filter = {}
    if (values.movement) filter.movement = values.movement
    if (values.name) filter.name = values.name
    if (typeof values.default !== 'undefined') filter.default = values.default
    if (values.creator) filter.creator = values.creator
    const types = await getTypesByFilterFromDB(filter)
    if (types) return types
    else return []
}

const getTypeById = async (id) => {
    if (!id) throw new TypeSearchError(NOT_ENOUGH_DATA)
    const type = await getById(id)
    if (type) return type
    else return null
}

const getTypesByMovementNameAndUserId = async ({movement, name, userId}) => {
    if(!movement || !name || !userId) throw new TypeSearchError(NOT_ENOUGH_DATA)
    const typesMatched = await getDefaultAndCustomTypesByUserId(userId)
    const typesMatchedFiltered = typesMatched.filter(type => (movement == type.movement && name === type.name))
    if(!typesMatchedFiltered) return []
    else return typesMatchedFiltered[0]
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
    const matchedDefaultType = await getByFilter({default:true, name: newName, movement: newMovement})
    if(matchedDefaultType.lenght<1) return deleteCreatorOfEachType(matchedDefaultType)
    // get the type to update from id
    const matchedType = await getTypeById(typeIdToUpdate)
    if(!matchedType) throw new TypeUpdateError(TYPE_NOT_FOUND)
    if(matchedType.default && isUserAnAdmin(user)) { // check if type creator is admin and the type is a default one
        const updatedDefaultType = await updateMovementAndNameInTypeById({id:typeIdToUpdate,name:newName,movement:newMovement})
        return deleteCreatorOfEachType(updatedDefaultType)
    } else if(!matchedType.default && Number(matchedType.creator) === user.id) { // check if the type is not a default and the creator 
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
    getTypesByCreator, // get types by creator
    deleteByIdAndCreator,
    getTypesByMovementNameAndUserId,
    updateTypeByIdAndUser, // update a type
    assignDefaultTypeByCreatorRole, // assign default element of type
    isMovement, // check if string is a movement
}

// deleteTypeByIdAndCreator, // delete a type
// deleteAllCustomTypesOfCreatorByCreatorId, // delete all custom types of cretor

// const deleteTypeById = async (id) => {
//     if (!id) throw new TypeDeleteError(NOT_ENOUGH_DATA)
//     const typeToDelete = await getTypeById(id)
//     if (typeToDelete) {
//         const deletedType = await deleteTypeByIdInDB(id)
//         return deletedType
//     } else throw new TypeDeleteError(TYPE_DELETING_ERROR)
// }

// const deleteTypeByIdAndCreator = async ({typeId:typeIdToDelete,creator:creator}) => {
    //     if(!typeIdToDelete || !creator.id || !creator.role) throw new TypeDeleteError(NOT_ENOUGH_DATA)
    
    
    //     if(await isTypeIdUsedInAmounts(typeIdToDelete)) throw new TypeDeleteError(TYPE_USED_IN_AMOUNT)
    
    //     if(isUserAnAdmin(creator) && typeMatched.default) { // if the type is default and the user is admin
    //         const deletedDefaultType = await deleteTypeById(typeIdToDelete)
    //         return deleteCreatorOfEachType(deletedDefaultType)
    //     } else if(!isUserAnAdmin(creator) && Number(typeMatched.creator) === creator.id) { // if user is a normal user and is the creator of the type, delete it
    //         const deletedCustomType = await deleteTypeById(typeIdToDelete)
    //         return deleteCreatorOfEachType(deletedCustomType)
    //     } else if (!isUserAnAdmin(creator) && Number(typeMatched.creator) !== creator.id) { // if user is a normal user and the type is not of that creator
//         throw new TypeDeleteError(TYPE_DELETE_UNAUTHORIZED)
//     } else {
    //         throw new TypeDeleteError(TYPE_DELETING_ERROR)
    //     }
    // }
    // const deleteAllCustomTypesOfCreatorByCreatorId = async (creatorId) => {
    //     if(!creatorId) throw new TypeDeleteError(NOT_ENOUGH_DATA)
    //     const typesToDelete = await getCustomTypesByCreatorId(creatorId)
    //     if(typesToDelete.length < 1) return []
    //     else {
        //         const deletedTypes = await Promise.all(typesToDelete.map(async (type) => {
    //             const deletedCustomType = await deleteTypeById(type.id)
    //             return deletedCustomType
    //         }))
    //         return deletedTypes
    //     }
    // }