
const { 
    NOT_ENOUGH_DATA,
    TYPE_CREATION_ERROR, 
    TYPE_SEARCHING_ERROR, 
    TYPE_DELETING_ERROR, 
    TYPE_UPDATING_ERROR, 
} = require('../errors/error-msg-list')
const {RepositoryError} = require('../errors')
const { Type } = require('../models')

const createTypeInDB = async (type) => { // create type
    if( !type.movement || 
        !type.name || 
        !type.created_at || 
        !type.creator || 
        typeof type.default === 'undefined') throw new RepositoryError(NOT_ENOUGH_DATA)
    try {
        const typeCreated = await Type.create(type)
        return typeCreated
    } catch(error) {
        throw new RepositoryError(TYPE_CREATION_ERROR)
    }
}

const getTypeByIdFromDB = async (typeId) => {
    if(!typeId) throw new RepositoryError(NOT_ENOUGH_DATA)
    where = {id: typeId}
    try {
        const type = await Type.findAll({where,raw:true})
        if(type.length>0) return type[0]
        else return null // type not founded
    } catch(error) {
        throw new RepositoryError(TYPE_SEARCHING_ERROR)
    }
}  

const getTypesByFilterFromDB = async (filter) => { // filter: creator, movement, name, default
    const where = {}
    if(filter.creator) where.creator = filter.creator // add creators id
    if(filter.movement) where.movement = filter.movement // add movement if filter requires
    if(filter.name) where.name = filter.name //add type name if filter require
    if(typeof filter.default !== 'undefined') where.default = filter.default // add default; true or false
    try {
        const types = await Type.findAll({where,raw:true})
        if(types.length>0) {
            if(types.length === 1) return types[0]
            return types
        } else return null
    } catch(error) {
        throw new RepositoryError(TYPE_SEARCHING_ERROR)
    }
}

const getTypesByCreatorIdFromDB = async (creatorId) => {
    if(!creatorId) throw new RepositoryError(NOT_ENOUGH_DATA)
    const where = {creator: creatorId}
    try {
        const types = await Type.findAll({where,raw:true})
        if(types.length>0) {
            if(types.length === 1) return types[0]
            return types
        } else return null
    } catch(error) {
        throw new RepositoryError(TYPE_SEARCHING_ERROR)
    }
}

const deleteTypeByIdInDB = async (typeId) => {
    if(!typeId) throw new RepositoryError(NOT_ENOUGH_DATA)
    const where = {id:typeId}
    try {
        const typeToDelete = await Type.findAll({where,raw:true})
        await Type.destroy({where})
        return typeToDelete[0]
    } catch(error){
        throw new RepositoryError(TYPE_DELETING_ERROR)
    }
}

const updateTypeByIdInDB = async (values) => { // values must contain type id
    if( !values.id || 
        !values.name || 
        !values.movement) throw new RepositoryError(NOT_ENOUGH_DATA)
    const where = {id:values.id}
    const newValues = {
        name:values.name,
        movement:values.movement
    }
    try{
        await Type.update(newValues,{where})
        const type = await Type.findAll({where,raw:true})
        return type[0]
    } catch(error){
        throw new RepositoryError(TYPE_UPDATING_ERROR)
    }
}

module.exports = {
    createTypeInDB,
    getTypeByIdFromDB,
    getTypesByFilterFromDB,
    getTypesByCreatorIdFromDB,
    deleteTypeByIdInDB,
    updateTypeByIdInDB,
}