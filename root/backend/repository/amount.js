
const { Amount } = require('../models')

const createAmountInDB = async (amount) => {
    if(!amount.quantity || !amount.type || !amount.creator || !amount.created_at) {
        return
    }
    const amountToCreate = {
        quantity: Number(amount.quantity),
        amountType: Number(amount.type),
        created_at: amount.created_at,
        creator: Number(amount.creator),
    }
    try {
        const result = await Amount.create(amountToCreate)
        return result
    } catch(error) {
        console.log(error)
        return
    }
}

const getAmountByIdFromDB = async (amountId) => {
    if(!amountId){
        return
    }
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
        console.log(error);
        return
    }
}

const getAmountsByFilterFromDB = async (filter) => { // filter: creator id and type id
    const where = {}
    if(filter.creator) where.creator = Number(filter.creator) // creators id
    if(filter.type) where.amountType = Number(filter.type)

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
        console.log(error)
        return
    }
}

const getAmountsByTypeIdFromDB = async (typeId) => { // filter: type id

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
        console.log(error)
        return
    }
}

const getAmountsByCreatorIdFromDB = async (creatorId) => {
    if(!creatorId) return
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
        console.log(error)
        return
    }
}

const deleteAmountByIdInDB = async (amountId) => {
    if(!amountId) return
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
        console.log(error)
        return 
    }
}

const updateAmountValuesInDB = async (values) => { // values contains: amount id, quantity and type id
    if(!values.id || !values.quantity || !values.type) return
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
        console.log(error)
        return
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