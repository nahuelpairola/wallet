
const {
    createAmountInDB,
    getAmountByIdFromDB,
    getAmountsByFilterFromDB,
    getAmountsByCreatorIdFromDB,
    deleteAmounByIdInDB,
    updateAmountInDB,
} = require('../repository/amount')

const {getTypesByCreatorId} = require('../services/type')

const getAmountsByFilter = async (values) => {

    const filter = {} // create filter object

    if(values.creator) {
        filter.creator = values.creator
    }

    if(values.type) {
        filter.type = values.type // type id
    }

    let data = null
    try {
        data = await getAmountsByFilterFromDB(filter)
    } catch (error) {
        return
    }
    
    if(values.created_at) {
        let date = values.created_at // format -> <startDate>;<endDate>

        let startDate = date.split(';')[0]
        if(startDate !== ''){
            startDate = new Date(startDate)
            data = data.filter(amount => {
                var date = new Date(amount.created_at)
                return (date >= startDate)
            })
        }
        let endDate = date.split(';')[1]
        if(endDate !== '') {
            endDate = new Date(endDate)
            data = data.filter(amount => {
                var date = new Date(amount.created_at)
                return (date <= endDate)
            })
        }
    }

    if(values.quantity) {
        let quantity = values.quantity // format -> <minQuantity>;<maxQuantity>

        let minQuantity = Number(quantity.split(';')[0])
        if(minQuantity !== ''){
            data = data.filter(amount => {
                return (amount.quantity >= minQuantity)
            })
        }
        let maxQuantity = Number(quantity.split(';')[1])
        if(maxQuantity !== '') {
            data = data.filter(amount => {
                return (amount.quantity <= maxQuantity)
            })
        }
    }

    const types = await getTypesByCreatorId(values.creator)
    data = data.map(amount => {
        let typeIndex = types.findIndex(t => Number(t.id)===Number(amount.type))
        amount.type = { name: types[typeIndex].name,
                        movement: types[typeIndex].movement,
                        default: types[typeIndex].default }
        return amount
    })

    if(values.movement){
        data = data.filter(amount => {
            return (amount.type.movement === values.movement)
        })
    }

    return data
}

const getAmountById = async (id) => {
    if(!id) return

    try {
        const amount = await getAmountByIdFromDB(id)
        return amount
    } catch (error) {
        console.log(error);
        return
    }
}

const storeAmount = async (values) => {
    if(!values.quantity || !values.type || !values.creator) return

    const amount = {
                quantity:values.quantity,
                type:values.type,
                created_at: new Date(),
                creator:values.creator
                }
    try {
        const result = await createAmountInDB(amount)
        return result
    } catch(error) {
        console.log(error)
        return 
    }
}

const deleteAmountById = async (id) => {
    if(!id) return
    
    try {
        const amountToDelete = await getAmountByIdFromDB(id)
        await deleteAmounByIdInDB(id)
        return amountToDelete
    } catch (error) {
        console.log(error)
        return
    }
}

module.exports = {
    getAmountsByFilter,
    getAmountById,
    storeAmount,
    deleteAmountById,
}