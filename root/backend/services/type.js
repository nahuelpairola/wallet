
const {
    NOT_ENOUGH_DATA,
    TYPE_DELETING_ERROR,
    TYPE_NOT_FOUND,
    TYPE_USED_IN_AMOUNT,
    TYPE_ALREADY_CREATED,
    TYPE_DELETE_UNAUTHORIZED,
    TYPE_UPDATING_ERROR,
} = require('../errors/error-msg-list')
const { ServiceError, NotFoundError } = require('../errors')
const {
    TypeDeleteError,
    TypeCreateError, 
    TypeSearchError, 
    TypeUpdateError
} = require('../errors/type-errors')

const repository = require('../repository/type')

const create = async (type) => {
    if(await repository.exists(type.movement,type.name,type.creator)) throw new TypeCreateError(TYPE_ALREADY_CREATED)
    type.created_at = new Date() // add created_at in type to create
    return await create(type)
}

const getByIdAndCreator = async (id,creator) => {
    if(!id) throw new TypeSearchError(NOT_ENOUGH_DATA)
    const type = await repository.getById(id)
    if(type && type.default) return type
    if(type && !type.default && type.creator === creator) return type
    return null
}

const getByCreatorMovementAndName = async (creator,movement,name) => {
    if(!creator || !movement || !name) throw new TypeSearchError(NOT_ENOUGH_DATA)
    return await repository.getByCreatorMovementAndName(creator,movement,name)
}

const getAllByCreator = async (creator) => {
    if(!creator) throw new TypeSearchError(NOT_ENOUGH_DATA)
    const types = await repository.getByCreator(creator)
    if(types.length === 0) throw new TypeSearchError(TYPE_NOT_FOUND)
    return types
}

const deleteByIdAndCreator = async ({id,creator}) => {
    if(!id || !creator) throw new TypeDeleteError(NOT_ENOUGH_DATA)
    const result = await repository.deleteByIdAndCreatorIfNotUsed(id,creator)
    if(result) return null
    else throw new TypeDeleteError(TYPE_DELETE_UNAUTHORIZED)
}

const deleteAllByCreator = async (creator) => {
    if(!creator) throw new TypeDeleteError(NOT_ENOUGH_DATA)
    return await repository.deleteAllByCreator(creator)
}

const updateByIdCreatorAndName = async ({id:id,creator:creator,name:name}) => {
    if(!id || !creator || !values.name) throw new TypeUpdateError(NOT_ENOUGH_DATA)
    const typeUpdated = await repository.updateByIdCreatorIdAndName(id,creator,name)
    return typeUpdated
}

module.exports = {
    create, // create new type
    getByIdAndCreator,
    getByCreatorMovementAndName,
    getAllByCreator, // get all types by creator
    deleteByIdAndCreator, // delete type by id and creator id
    deleteAllByCreator,
    updateByIdCreatorAndName, // update a type y creator id and type name
}