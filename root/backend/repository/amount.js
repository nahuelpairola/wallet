
const { Amount } = require('../models/Amount')

const getDataByFilter = async (filter) => { // filter: creator id and type id
    const where = {}
    if(filter.creator){
        where.creator = filter.creator
    }
    if(filter.type) {
        where.type = filter.type
    }

    const amounts = await Amount.findAll({where})
    return amounts
}

const getDataById = async (id) => {
    const where = {}
    where.id = id
    const amount = await Amount.findOne({where})
    return amount
}

const createData = async (amount) => {
    try {
        const result = await Amount.create(amount)
        return result
    } catch(error) {
        console.log(error)
        return
    }
}

const destroyDataById = async (id) => {
    const where = {}
    where.id = id

    try {
        const result = await Amount.destroy({where})
        return
    } catch (error) {
        console.log(error)
        return 
    }
}

module.exports = {
    getDataByFilter,
    getDataById,
    createData,
    destroyDataById
}