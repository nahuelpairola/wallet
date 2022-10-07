
const { NOT_ENOUGH_DATA, } = require('../errors/error-msg-list')
const { TypeCreateError, TypeSearchError, TypeDeleteError, TypeUpdateError } = require('../errors/type-errors')
const { Type } = require('../models')

const createTypeInDB = async (newType) => { // create type
    if( !newType.movement || 
        !newType.name || 
        !newType.created_at || 
        !newType.creator || 
        typeof newType.default === 'undefined') throw new TypeCreateError(NOT_ENOUGH_DATA)
    const typeCreated = await Type.create(newType)
    const typeCreatedRaw = typeCreated.dataValues
    return typeCreatedRaw
}

const getTypeByIdFromDB = async (typeId) => {
    if(!typeId) throw new TypeSearchError(NOT_ENOUGH_DATA)
    where = {id: typeId}
    const type = await Type.findByPk(typeId,{raw: true})
    if(type) return type
    else return null // type not founded
}

const getTypesByFilterFromDB = async (filter) => { // filter: creator, movement, name and default
    if( !filter.creator &&
        !filter.movement &&
        !filter.name &&
        typeof filter.default === 'undefined') throw new TypeSearchError(NOT_ENOUGH_DATA)
    const where = {}
    if(filter.creator) where.creator = filter.creator // add creators id
    if(filter.movement) where.movement = filter.movement // add movement if filter requires
    if(filter.name) where.name = filter.name //add type name if filter require
    if(typeof filter.default !== 'undefined') where.default = filter.default // add default; true or false

    const types = await Type.findAll({where,raw:true,order: [['id', 'ASC']]})
    if(types.length>0) {
        // if(types.length === 1) return types[0] // found one type
        return types 
    } else return null // types not founded
}

const getTypesByCreatorIdFromDB = async (creatorId) => {
    if(!creatorId) throw new TypeSearchError(NOT_ENOUGH_DATA)
    const where = {creator: creatorId}
    const types = await Type.findAll({where,raw:true,order: [['id', 'ASC']]})
    if(types.length>0) {
        // if(types.length === 1) return types[0]
        return types
    } else return null // types not founded
}

const deleteTypeByIdInDB = async (typeId) => {
    if(!typeId) throw new TypeDeleteError(NOT_ENOUGH_DATA)
    const where = {id:typeId}
    const typeToDelete = await Type.findAll({where,raw:true})
    if(!typeToDelete) return null
    await Type.destroy({where})
    return typeToDelete[0]
    // return typeToDelete
}

const updateNameAndMovementInTypeByIdInDB = async (idNameAndMovement) => { // values must contain type id
    if( !idNameAndMovement.id || 
        !idNameAndMovement.name || 
        !idNameAndMovement.movement) throw new TypeUpdateError(NOT_ENOUGH_DATA)
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
    // return type
}

const isMovement = (movementToCompare) => {
    const isMatch = Type.rawAttributes.movement.values.includes(movementToCompare)
    if(isMatch) return true
    else return false
}

module.exports = {
    createTypeInDB,
    getTypeByIdFromDB,
    getTypesByFilterFromDB,
    getTypesByCreatorIdFromDB,
    deleteTypeByIdInDB,
    updateNameAndMovementInTypeByIdInDB,
    isMovement
}