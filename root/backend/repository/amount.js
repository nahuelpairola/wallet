
const { RepositoryError } = require('../errors')
const { NOT_ENOUGH_DATA,
        AMOUNT_CREATION_ERROR,
        AMOUNT_SEARCHING_ERROR,
        AMOUNT_DELETING_ERROR,
        AMOUNT_UPDATING_ERROR 
    } = require('../errors/error-msg-list')
const { Amount} = require('../models')

const createAmountInDB = async (amountToCreate) => {
    if( !amountToCreate.quantity || 
        !amountToCreate.amountType || 
        !amountToCreate.creator || 
        !amountToCreate.created_at) throw new Error(NOT_ENOUGH_DATA)
    
    try {
        const amountCreated = await Amount.create(amountToCreate)
        return amountCreated
    } catch(error) {
        throw new RepositoryError(AMOUNT_CREATION_ERROR,error)
    }
}

const getAmountByIdFromDB = async (amountId) => {
    if(!amountId) throw new RepositoryError(NOT_ENOUGH_DATA)
    const where = {id: amountId}
    try {
        const amount = await Amount.findAll({
            where, 
            attributes: { exclude: ['amountType','creator'] },
            raw:true,
            include: { 
                all: true,
                attributes: {exclude:['first_name','last_name','email','role','password','created_at','creator']}
            }
        })
        if(amount.length>0){
            return amount[0]
        }
        return
    } catch(error){
        throw new RepositoryError(AMOUNT_SEARCHING_ERROR, error)
    }
}

const getAmountsByFilterFromDB = async (filter) => { // filter: creator id and type id
    const where = {}
    if(filter.creator) where.creator = filter.creator // creators id
    if(filter.type) where.amountType = filter.type

    try {
        const amounts = await Amount.findAll({  
            where, 
            attributes: { exclude: ['amountType','creator'] },
            raw:true,
            include: { 
                all: true,
                attributes: {exclude:['first_name','last_name','email','role','password','created_at','creator']}
            }
        })
        if(amounts.length>0) return amounts
        return
    } catch (error) {
        throw new RepositoryError(AMOUNT_SEARCHING_ERROR, error)
    }
}

const getAmountsByTypeIdFromDB = async (typeId) => { // filter: type id
    if(!typeId) throw new RepositoryError(NOT_ENOUGH_DATA)
    const where = {type:typeId}
    try {
        const amounts = await Amount.findAll({
            where, 
            attributes: { exclude: ['amountType','creator'] },
            raw:true,
            include: { 
                all: true,
                attributes: {exclude:['first_name','last_name','email','role','password','created_at','creator']}
            }
        })
        if(amounts.length>0) return amounts
        return
    } catch (error) {
        throw new RepositoryError(AMOUNT_SEARCHING_ERROR, error)
    }
}

const getAmountsByCreatorIdFromDB = async (creatorId) => {
    if(!creatorId) throw new RepositoryError(NOT_ENOUGH_DATA)
    const where = {creator: creatorId}
    try {
        const amounts = await Amount.findAll({
            where, 
            attributes: { exclude: ['amountType','creator'] },
            raw:true,
            include: {
                all: true,
                attributes: {exclude:['first_name','last_name','email','role','password','created_at','creator']}
            }
        })
        if(amounts.length>0) return amounts
    } catch (error) {
        throw new RepositoryError(AMOUNT_SEARCHING_ERROR, error)
    }
}

const deleteAmountByIdInDB = async (amountId) => {
    if(!amountId) throw new RepositoryError(NOT_ENOUGH_DATA)
    const where = {id:amountId}
    try {
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
        return amount[0] // returning amount deleted
    } catch (error) {
        throw new RepositoryError(AMOUNT_DELETING_ERROR,error) 
    }
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
    try {
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
        return amount[0]
    } catch (error) {
        throw new RepositoryError(AMOUNT_UPDATING_ERROR, error)
    }
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