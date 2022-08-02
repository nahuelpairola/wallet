
const { Amount } = require('../models/Amount')


const getData = async (filter) => {
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

const createData = async (amount) => {
    try {
        console.log(amount)
        const result = await Amount.create(amount)
        return result
    } catch(error) {
        console.log(error)
        return
    }
}

module.exports = {
    getData,
    createData
}