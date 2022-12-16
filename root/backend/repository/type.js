
const {sequelize} = require('../db/connect')
const { Op, QueryTypes } = require('sequelize')
const { NOT_ENOUGH_DATA, } = require('../errors/error-msg-list')
const { TypeCreateError, TypeSearchError, TypeDeleteError, TypeUpdateError } = require('../errors/type-errors')
const { Type } = require('../models')

const create = async (newType) => { // create type
    if( !newType.movement || 
        !newType.name || 
        !newType.created_at || 
        !newType.creator || 
        typeof newType.default === 'undefined') throw new TypeCreateError(NOT_ENOUGH_DATA)
    const typeCreated = await Type.create(newType)
    const typeCreatedRaw = typeCreated.dataValues
    return typeCreatedRaw
}

const exists = async (type) => { 
    // check if it is not a default type OR a custom type
    if( !type.movement || 
        !type.name ||
        !type.creator || 
        typeof type.default === 'undefined') throw new TypeCreateError(NOT_ENOUGH_DATA)
    const result = await Type.findOne({
        where:{
            [Op.or]:[
                {
                    [Op.and]:[{movement:type.movement},{name:type.name},{default:true}]
                },
                {
                    [Op.and]:[{movement:type.movement},{name:type.name},{default:false},{creator:type.creator}]
                }
            ]
        },
        raw:true
    })
    return (result === null ? false : true)
}

const getByCreator = async (creatorId) => {
    if(!creatorId) throw new TypeSearchError(NOT_ENOUGH_DATA)
    const allTypes = await Type.findAll({
        where:{[Op.or]:[
            {default:true},
            {creator:creatorId}
        ]},
        order:[['created_at', 'DESC'],['id','DESC']],
        raw:true
    })
    return allTypes
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

const deleteByIdAndCreatorIfNotUsed = async ({id,creator}) => {
    if(!id || !creator) throw new TypeDeleteError(NOT_ENOUGH_DATA)
    const result = await sequelize.query(
        `DELETE FROM types 
        WHERE (types.id = ${id}) 
        AND (types.creator = ${creator}) 
        AND NOT (EXISTS 
            (SELECT * FROM amounts WHERE "amountType" = ${id}))`)
    return (result[1].rowCount === 1 ? true : false) 
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
    create,
    getTypesByFilterFromDB,
    updateNameAndMovementInTypeByIdInDB,
    isMovement,
    exists,
    getByCreator,
    deleteByIdAndCreatorIfNotUsed
}