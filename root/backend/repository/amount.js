
const {AmountCreateError, AmountSearchError, AmountUpdateError, AmountDeleteError} = require('../errors/amount-errors')
const { NOT_ENOUGH_DATA } = require('../errors/error-msg-list')
const { Amount} = require('../models')

const renameAmounts = (amounts) => { // rename elements in amounts, a single one or an array
    const renamedAmounts = amounts.map( (amount) => {
        return renameSingleAmount(amount) // rename single amount
    })
    return renamedAmounts
}

const renameSingleAmount = (amount) => {    
    delete amount['user.id']
    if(amount['user.id']){
    }
    if(amount['type.id']){
        amount.typeId = amount['type.id']
        delete amount['type.id']
    }
    if(amount['type.movement']){
        amount.movement = amount['type.movement']
        delete amount['type.movement']
    }
    if(amount['type.name']){
        amount.type = amount['type.name']
        delete amount['type.name']
    }        
    if(typeof amount['type.default'] !== 'undefined'){
        amount.default = amount['type.default']
        delete amount['type.default']
    }
    amount.quantity = Number(amount.quantity)        
    return amount
}

const createAmountInDB = async (amountToCreate) => {
    if( !amountToCreate.quantity || 
        !amountToCreate.amountType || 
        !amountToCreate.creator || 
        !amountToCreate.created_at) throw new AmountCreateError(NOT_ENOUGH_DATA)
    const amount = await Amount.create(amountToCreate)
    const amountCreated = await getAmountByIdFromDB(amount.dataValues.id)
    return amountCreated
}

const getAmountByIdFromDB = async (amountId) => {
    if(!amountId) throw new AmountSearchError(NOT_ENOUGH_DATA)
    // const where = {id: amountId}
    const amount = await Amount.findByPk(amountId,{
        attributes: { exclude: ['amountType'] },
        raw:true,
        include: { 
            all: true,
            attributes: {exclude:['first_name','last_name','email','role','password','created_at','creator']}
        }
    })
    if(!amount) return null
    else {
        const renamedAmount = renameSingleAmount(amount)
        return renamedAmount
    }
}

const getAmountsByFilterFromDB = async (filter) => { // filter: creator id and type id
    const where = {}
    if(filter.creator) where.creator = filter.creator // creator id
    if(filter.type) where.amountType = filter.type
    const amounts = await Amount.findAll({  
        where, 
        attributes: { exclude: ['amountType'] },
        raw:true,
        include: {
            all: true,
            attributes: {exclude:['id','first_name','last_name','email','role','password','created_at','creator']}
        }
    })
    const renamedAmounts = renameAmounts(amounts)
    return renamedAmounts
}

const getAtLeastOneAmountUsingThisTypeIdInDB = async (typeId) => { // type id
    if(!typeId) throw new AmountSearchError(NOT_ENOUGH_DATA)
    const where = {amountType:typeId}
    const singleAmount = await Amount.findOne({
        where, 
        attributes: { exclude: ['amountType'] },
        raw:true,
        include: { 
            all: true,
            attributes: {exclude:['first_name','last_name','email','role','password','created_at','creator']}
        }
    })
    if(!singleAmount) return null
    else {
        const renamedAmount = renameSingleAmount(singleAmount)
        return renamedAmount
    }
}

const getAmountsByCreatorIdFromDB = async (creatorId) => {
    if(!creatorId) throw new AmountSearchError(NOT_ENOUGH_DATA)
    const where = {creator: creatorId}
    const amounts = await Amount.findAll({
        where, 
        attributes: { exclude: ['amountType'] },
        raw:true,
        include: {
            all: true,
            attributes: {exclude:['first_name','last_name','email','role','password','created_at','creator']}
        },
        order: [['id', 'ASC']]
    })
    const renamedAmounts = renameAmounts(amounts)
    return renamedAmounts
}

const deleteAmountByIdInDB = async (amountId) => {
    if(!amountId) throw new AmountDeleteError(NOT_ENOUGH_DATA)
    const amountDeleted = await getAmountByIdFromDB(amountId)
    const where = {id:amountId}
    await Amount.destroy({where}) // destroy amount in db
    return amountDeleted
}

const updateAmountByIdQuantityAndAmountTypeInDB = async (values) => { // values contains: amount id, quantity and type id
    if( !values.id || 
        !values.quantity || 
        !values.amountType) throw new AmountUpdateError(NOT_ENOUGH_DATA)
    const where = {id: values.id}
    const newValues = {
        quantity:values.quantity,
        amountType:values.amountType
    }
    await Amount.update(newValues,{where})
    const renamedAmount = await getAmountByIdFromDB(values.id)
    return renamedAmount
}

module.exports = {
    createAmountInDB,
    getAmountByIdFromDB,
    getAmountsByFilterFromDB,
    getAtLeastOneAmountUsingThisTypeIdInDB,
    getAmountsByCreatorIdFromDB,
    deleteAmountByIdInDB,
    updateAmountByIdQuantityAndAmountTypeInDB,
}