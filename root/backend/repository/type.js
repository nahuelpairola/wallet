
const { Type } = require('../models/Type')

const createTypeInDB = async (type) => { // create type
    if(!type.movement || !type.name || !type.created_at || !type.creator || typeof type.default === undefined) return
    
    try {
        const result = await Type.create(type)
        return result
    } catch(error) {
        console.log(error)
        return
    }
}

const getTypeByIdFromDB = async (id) => {
    if(!id) return

    where = {}
    where.id = id

    try {
        const type = await Type.findAll({where,raw:true})
        if(type.length>0) return type[0]
        return
    } catch(error) {
        console.log(error)
        return
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
        if(types.length>0) return types
        return
    } catch(error) {
        console.log(error)
        return
    }
}

const getTypesByCreatorIdFromDB = async (id) => {
    if(!id) return

    const where = {}
    where.creator = id

    try {
        const types = await Type.findAll({where,raw:true})
        if(types.length>0) return types
        return
    } catch(error) {
        console.log(error)
        return
    }
}

const deleteTypeByIdInDB = async (id) => {
    if(!id) return

    const where = {}
    where.id = id

    try {
        const type = await Type.findAll({where,raw:true})
        await Type.destroy({where})
        return type[0]
    } catch(error){
        console.log(error)
        return
    }
}

const updateTypeByIdInDB = async (values) => { // values must contain type id
    if(!values.id || !values.name || !values.movement) return

    const where = {}
    where.id = values.id

    const newValues = {}
    newValues.name=values.name
    newValues.movement=values.movement
    
    try{
        await Type.update(newValues,{where})
        const type = await Type.findAll({where,raw:true})
        return type[0]
    } catch(error){
        console.log(error)
        return
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