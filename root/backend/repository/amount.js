
const { Amount } = require('../models')

const createAmountInDB = async (amount) => {
    if(!amount.quantity || !amount.type || !amount.creator || !amount.created_at) {
        return
    }
    try {
        // const result = await Amount.create(amount)
        const result = Amount.addAmount
        return result
    } catch(error) {
        console.log(error)
        return
    }
}

const getAmountByIdFromDB = async (id) => {
    if(!id){
        return
    }
    const where = {}
    where.id = id
    try {
        const amount = await Amount.findAll({where,raw:true})
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
    if(filter.creator) where.creator = filter.creator // creators id
    if(filter.type) where.type = filter.type

    try {
        const amounts = await Amount.findAll({where,raw:true})
        const type = await amounts.getType()
        console.log(type);
        if(amounts.length>0) return amounts
        return
    } catch (error) {
        console.log(error)
        return
    }
}

const getAmountsByCreatorIdFromDB = async (id) => {
    if(!id) return

    const where = {}
    where.creator=id

    try {
        const amounts = await Amount.findAll({where,raw:true})
        if(amounts.length>0) return amounts
    } catch (error) {
        console.log(error)
        return
    }
}

const deleteAmounByIdInDB = async (id) => {
    if(!id) return

    const where = {}
    where.id = id

    try {
        const amount = await Amount.findAll({where,raw:true})
        await Amount.destroy({where})
        return amount[0]
    } catch (error) {
        console.log(error)
        return 
    }
}

const updateAmountInDB = async (values) => {
    if(!values.id || !values.quantity || !values.type) return

    const where = {}
    where.id = values.id

    const newValues = {
        quantity:values.quantity,
        type:values.type
    }

    try {
        await Amount.update(newValues,{where})
        const amount = await Amount.findAll({where, raw:true})
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
    getAmountsByCreatorIdFromDB,
    deleteAmounByIdInDB,
    updateAmountInDB,
}