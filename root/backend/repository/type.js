
const { NOT_ENOUGH_DATA, } = require('../errors/error-msg-list')
const { RepositoryError } = require('../errors')
const { Type } = require('../models')

const createTypeInDB = async (newType) => { // create type
    if( !newType.movement || 
        !newType.name || 
        !newType.created_at || 
        !newType.creator || 
        typeof newType.default === 'undefined') throw new RepositoryError(NOT_ENOUGH_DATA)
    const typeCreated = await Type.create(newType)
    return typeCreated
}

const getTypeByIdFromDB = async (typeId) => {
    if(!typeId) throw new RepositoryError(NOT_ENOUGH_DATA)
    where = {id: typeId}
    const type = await Type.findAll({where,raw:true})
    if(type.length>0) return type[0]
    else return null // type not founded
}

const getTypesByFilterFromDB = async (filter) => { // filter: creator, movement, name or default
    if( !filter.creator &&
        !filter.movement &&
        !filter.name &&
        typeof filter.default === 'undefined') throw new RepositoryError(NOT_ENOUGH_DATA)

    const where = {}
    if(filter.creator) where.creator = filter.creator // add creators id
    if(filter.movement) where.movement = filter.movement // add movement if filter requires
    if(filter.name) where.name = filter.name //add type name if filter require
    if(typeof filter.default !== 'undefined') where.default = filter.default // add default; true or false

    const types = await Type.findAll({where,raw:true})
    if(types.length>0) {
        if(types.length === 1) return types[0] // found one type
        return types 
    } else return null // types not founded
}

const getTypesByCreatorIdFromDB = async (creatorId) => {
    if(!creatorId) throw new RepositoryError(NOT_ENOUGH_DATA)
    const where = {creator: creatorId}
    const types = await Type.findAll({where,raw:true})
    if(types.length>0) {
        if(types.length === 1) return types[0]
        return types
    } else return null // types not founded
}

const deleteTypeByIdInDB = async (typeId) => {
    if(!typeId) throw new RepositoryError(NOT_ENOUGH_DATA)
    const where = {id:typeId}
    const typeToDelete = await Type.findAll({where,raw:true})
    if(!typeToDelete) return null
    await Type.destroy({where})
    return typeToDelete[0]
}

const updateNameAndMovementInTypeByIdInDB = async (idNameAndMovement) => { // values must contain type id
    if( !idNameAndMovement.id || 
        !idNameAndMovement.name || 
        !idNameAndMovement.movement) throw new RepositoryError(NOT_ENOUGH_DATA)
    const where = {id: idNameAndMovement.id}
    const newNameAndMovement = {
        name: idNameAndMovement.name,
        movement: idNameAndMovement.movement
    }
    await Type.update(newNameAndMovement,{where})
    const type = await Type.findAll({
        where,
        raw:true
    })
    return type[0]
}

module.exports = {
    createTypeInDB,
    getTypeByIdFromDB,
    getTypesByFilterFromDB,
    getTypesByCreatorIdFromDB,
    deleteTypeByIdInDB,
    updateNameAndMovementInTypeByIdInDB,
}