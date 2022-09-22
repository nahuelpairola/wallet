
const { RepositoryError } = require('../errors')
const { NOT_ENOUGH_DATA } = require('../errors/error-msg-list')
const { Amount} = require('../models')

const renameAmounts = (amounts) => {
    if(amounts.length>1) { // for amount array
        const amountsToProcess = amounts.map(amount=>{
            return renameSingleAmount(amount)  
        })
        return amountsToProcess
    } else { // for single amount
        return renameSingleAmount(amounts) 
    }
}

const renameSingleAmount = (amount) => {    
    if(amount['user.id']){
        amount.creator = amount['user.id']
        delete amount['user.id']
    }
    if(amount['type.movement']){
        amount.movement = amount['type.movement']
        delete amount['type.movement']
    }
    if(amount['type.name']){
        amount.type = amount['type.name']
        delete amount['type.name']
    }        
    if(amount['type.default']){
        amount.default = amount['type.default']
        delete amount['type.default']
    }
    return amount
}

const createAmountInDB = async (amountToCreate) => {
    if( !amountToCreate.quantity || 
        !amountToCreate.amountType || 
        !amountToCreate.creator || 
        !amountToCreate.created_at) throw new RepositoryError(NOT_ENOUGH_DATA)
    const amountCreated = await Amount.create(amountToCreate)
    return renameAmounts(amountCreated)
}

const getAmountByIdFromDB = async (amountId) => {
    if(!amountId) throw new RepositoryError(NOT_ENOUGH_DATA)
    const where = {id: amountId}
    const amount = await Amount.findAll({
        where, 
        attributes: { exclude: ['amountType','creator'] },
        raw:true,
        include: { 
            all: true,
            attributes: {exclude:['first_name','last_name','email','role','password','created_at','creator']}
        }
    })
    if(amount.length>0) return renameAmounts(amount[0])
    else return null
}

const getAmountsByFilterFromDB = async (filter) => { // filter: creator id and type id
    const where = {}
    if(filter.creator) where.creator = filter.creator // creators id
    if(filter.type) where.amountType = filter.type
    const amounts = await Amount.findAll({  
        where, 
        attributes: { exclude: ['amountType','creator'] },
        raw:true,
        include: { 
            all: true,
            attributes: {exclude:['id','first_name','last_name','email','role','password','created_at','creator']}
        }
    })
    if(amounts.length>0) return renameAmounts(amounts)
    else return null
}

const getAmountsByTypeIdFromDB = async (typeId) => { // filter: type id
    if(!typeId) throw new RepositoryError(NOT_ENOUGH_DATA)
    const where = {type:typeId}
    const amounts = await Amount.findAll({
        where, 
        attributes: { exclude: ['amountType','creator'] },
        raw:true,
        include: { 
            all: true,
            attributes: {exclude:['first_name','last_name','email','role','password','created_at','creator']}
        }
    })
    if(amounts.length>0) return renameAmounts(amounts)
    else return null
}

const getAmountsByCreatorIdFromDB = async (creatorId) => {
    if(!creatorId) throw new RepositoryError(NOT_ENOUGH_DATA)
    const where = {creator: creatorId}
    const amounts = await Amount.findAll({
        where, 
        attributes: { exclude: ['amountType','creator'] },
        raw:true,
        include: {
            all: true,
            attributes: {exclude:['id','first_name','last_name','email','role','password','created_at','creator']}
        }
    })
    if(amounts.length>0) renameAmounts(amounts)
    else return null
}

const deleteAmountByIdInDB = async (amountId) => {
    if(!amountId) throw new RepositoryError(NOT_ENOUGH_DATA)
    const where = {id:amountId}
    const amount = await Amount.findAll({ // get amount to return as amount deleted
        where, 
        attributes: { exclude: ['amountType','creator'] },
        raw:true,
        include: { 
            all: true,
            attributes: {exclude:['first_name','last_name','email','role','password','created_at','creator']}
        }
    }) 
    await Amount.destroy({where}) // destroying amount in db
    return renameAmounts(amount[0]) // returning amount deleted
}

const updateAmountValuesInDB = async (values) => { // values contains: amount id, quantity and type id
    if( !values.id || 
        !values.quantity || 
        !values.type) throw new RepositoryError(NOT_ENOUGH_DATA)
    const where = {id: values.id}
    const newValues = {
        quantity:values.quantity,
        type:values.type
    }
    await Amount.update(newValues,{where})
    const amount = await Amount.findAll({
        where, 
        attributes: { exclude: ['amountType','creator'] },
        raw:true,
        include: { 
            all: true,
            attributes: {exclude:['first_name','last_name','email','role','password','created_at','creator']}
        }
    })
    return renameAmounts(amount[0])
}

module.exports = {
    createAmountInDB,
    getAmountByIdFromDB,
    getAmountsByFilterFromDB,
    getAmountsByTypeIdFromDB,
    getAmountsByCreatorIdFromDB,
    deleteAmountByIdInDB,
    updateAmountValuesInDB,
}