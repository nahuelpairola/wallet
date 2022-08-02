
const {Type} = require('../models/Type')

/**
 * _createType(type) -> return type created OR type if already exists
 * _getTypeById(typeId) -> return type if exists
 * _getTypesCustomsByFilter(movement, typeName and creator): 
 *      devuelve tipos segun creador, movimiento y/o nombre de tipo, 
 *      el creador puede ser admin o user
 * _getTypesByCreatorId(creatorId):
 *      devuelve tipos creados por el id del user
 * _getTypesDefaultByFilter():
 *      devuelve tipos creados por admin, cualquiera tiene acceso a éstos y se requiere filter
 * _deleteTypeById(values) -> values={typeId,creatorId}, sólo puede eliminarlo el creador
 * _updateTypeById(values) -> values={typeId, valores a modificar, creatorId}, sólo modifica el creador los creados por él
 */


const _createType = async (type) => {
    if(!type.movement || !type.name || !type.created_at || !type.creator) {
        return
    }
    try {
        const result = await Type.create(type)
        return (result)
    } catch(error) {
        console.log(error)
        return
    }
}

const _getTypeById = async (typeId) => {
    if(!typeId) {
        return
    }
    where = {id:typeId}
    try {
        const type = await Type.findAll({where})
        if(type.length>0) {
            return type
        } else {
            return
        }
    } catch(error) {
        console.log(error)
        return
    }
}

const _getTypesCustomsByFilter = async (filter) => {
    if(!filter.creator){
        return
    }
    const where = {creator:filter.creator} // add creators id
    if(filter.movement){
        where.movement=filter.movement // add movement if filter requires
    }
    if(filter.name){
        where.name=filter.name //add type name if filter require
    }
    where.default = false // only custom types
    try {
        const types = await Type.findAll({where})
        if(types.length>0) {
            return (types)
        } else {
            return
        }
    } catch(error) {
        console.log(error)
        return
    }
}

const _getTypesByCreatorId = async (creatorId) => {
    if(!creatorId){
        return
    }
    const where = {creator:creatorId}
    try {
        const types = await Type.findAll({where})
        if(types.length>0) {
            return (types)
        } else {
            return
        }
    } catch(error) {
        console.log(error)
        return
    }
}

const _getTypesDefaultByFilter = async (filter) => {
    const where = {default:true}
    if(filter){
        if(filter.movement){
            where.movement=filter.movement // add movement if filter requires
        }
        if(filter.name){
            where.name=filter.name //add type name if filter require
        }
    }
    try {
        const types = await Type.findAll({where})
        if(types.length>0) {
            return (types)
        } else {
            return
        }
    } catch(error) {
        console.log(error)
        return
    }
}

const _deleteTypeById = async (id) => {
    if(!id){
        return
    }
    const where = {id:id}
    try{
        const type = await Type.findAll({where})
        await Type.destroy({where})
        return type
    } catch(error){
        console.log(error)
        return
    }
}

const _updateTypeById = async (values) => { // VERIFICAR
    if(!values.id) {
        return
    }
    const where = {id:values.id}
    const newValues = {}
    if(values.name) {
        newValues.name=values.name
    }
    if(values.movement){
        newValues.movement=values.movement
    }
    try{
        await Type.update(newValues,{where})
        const type = await Type.findAll({where})
        return type
    } catch(error){
        console.log(error)
        return
    }
}

module.exports = {
    _createType,
    _deleteTypeById,
    _getTypeById,
    _getTypesCustomsByFilter,
    _getTypesByCreatorId,
    _updateTypeById,
    _getTypesDefaultByFilter,
}