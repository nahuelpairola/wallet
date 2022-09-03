
const { Amount , Type, User} = require('../models')

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
    console.log(amountToCreate);
    try {
        const result = await Amount.create(amountToCreate)
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
    if(filter.creator) where.creator = Number(filter.creator) // creators id
    if(filter.type) where.amountType = Number(filter.type)

    try {
        const amounts = await Amount.findAll({  where, 
                                                attributes: { exclude: ['amountType'] }, 
                                                raw:true, 
                                                include: Type})
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