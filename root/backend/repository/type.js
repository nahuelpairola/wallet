
const {sequelize} = require('../db/connect')
const { Op } = require('sequelize')
const { NOT_ENOUGH_DATA, TYPE_UPDATING_ERROR, } = require('../errors/error-msg-list')
const { TypeCreateError, TypeSearchError, TypeDeleteError, TypeUpdateError } = require('../errors/type-errors')
const { Type } = require('../models')

const create = async function (movement,name,created_at,creator,def) { // create type
    if( !movement || 
        !name || 
        !created_at || 
        !creator || 
        typeof def === 'undefined') throw new TypeCreateError(NOT_ENOUGH_DATA)
    const typeCreated = await Type.create({movement,name,created_at,creator,default:def})
    return typeCreated.dataValues
}

const exists = async (movement,name,creator) => {
    // check if it is not a default type OR a custom type
    if( !movement || 
        !name ||
        !creator) throw new TypeCreateError(NOT_ENOUGH_DATA)
    const result = await Type.findOne({
        where:{
            [Op.or]:[
                {
                    [Op.and]:[{movement},{name},{default:true}] // type by default
                },
                {
                    [Op.and]:[{movement},{name},{default:false},{creator}] // custom type
                }
            ]
        },
        raw:true
    })
    return (result === null ? false : true)
}

const getByCreator = async (creator) => {
    if(!creator) throw new TypeSearchError(NOT_ENOUGH_DATA)
    const allTypes = await Type.findAll({
        where:{[Op.or]:[
            {default:true},
            {creator}
        ]},
        order:[['created_at', 'ASC'],['id','ASC']],
        raw:true
    })
    return allTypes
}

const deleteByIdAndCreatorIfNotUsed = async (id,creator) => {
    if(!id || !creator) throw new TypeDeleteError(NOT_ENOUGH_DATA)
    const result = await sequelize.query(
        `DELETE FROM types 
        WHERE (types.id = ${id} AND types.creator = ${creator})
        AND NOT (EXISTS 
            (SELECT * FROM amounts WHERE "amountType" = ${id}))`)
    return (result[1].rowCount === 1 ? true : false)
}

const deleteAllByCreator = async (creator) => {
    if(!creator) throw new TypeDeleteError(NOT_ENOUGH_DATA)
    const result = await sequelize.query(
        `DELETE FROM types 
        WHERE (types.creator = ${creator})
        AND NOT (EXISTS 
            (SELECT * FROM amounts WHERE "creator" = ${creator}))`)
    return result[1].rowCount
}

const updateByIdCreatorIdAndName = async (id,creator,name) => {
    if(!id || !creator || !name) throw new TypeUpdateError(NOT_ENOUGH_DATA)
    const result = await Type.update({name},{where:{id,creator}})
    if(result[0] === 0) throw new TypeUpdateError(TYPE_UPDATING_ERROR)
    return await Type.findOne({where:{id:id},raw:true})
}

const getById = async (id) => {
    if(!id) throw new TypeSearchError(NOT_ENOUGH_DATA)
    return await Type.findByPk(id,{raw:true})
}

const getByCreatorMovementAndName = async (creator,movement,name) => {
    if(!creator || !movement || !name) throw new TypeSearchError(NOT_ENOUGH_DATA)
    return await Type.findOne({
        where:{[Op.or]:[
            {default:true,movement,name},
            {creator,movement,name}
        ]},
        raw:true})
}

module.exports = {
    exists,
    create,
    updateByIdCreatorIdAndName,
    getById,
    getByCreator,
    deleteByIdAndCreatorIfNotUsed,
    deleteAllByCreator,
    getByCreatorMovementAndName
}