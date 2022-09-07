
const {
    createAmountInDB,
    getAmountByIdFromDB,
    getAmountsByFilterFromDB,
    getAmountsByTypeIdFromDB,
    getAmountsByCreatorIdFromDB,
    deleteAmountByIdInDB,
    updateAmountValuesInDB,
} = require('../repository/amount')

const {getTypesByCreatorId, getTypesByFilter, getTypeById} = require('../services/type')

const getAmountsByFilter = async (values) => {
    if(!values.creator) return
    const filter = { // create filter object
        creator:values.creator
    }
    let data = null // where goes the amounts data
    try { // get amounts by creator
        data = await getAmountsByCreatorIdFromDB(values.creator)
    } catch (error) {
        return
    }

    if(values.created_at) { // check if there are dates to filter
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

        let minQuantity = quantity.split(';')[0]
        if(minQuantity !== ''){
            console.log(minQuantity);
            data = data.filter(amount => {
                return (Number(amount.quantity) >= Number(minQuantity))
            })
        }
        let maxQuantity = quantity.split(';')[1]
        if(maxQuantity !== '') {
            data = data.filter(amount => {
                return (Number(amount.quantity) <= Number(maxQuantity))
            })
        }
    }

    if(values.movement) {
        data = data.filter(amount => {
            return (amount['type.movement'] === values.movement)
        })
    }

    if(values.type) {
        const types = (values.type).split(',')
        types.forEach((type)=>{
            data = data.filter(amount => {
                return (amount['type.name'] === type)

            })
        })
    }

    return data
}

const getAmountById = async (amountId) => {
    if(!amountId) return

    try {
        const amount = await getAmountByIdFromDB(amountId)
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
                type:Number(values.type),
                created_at: new Date(),
                creator:Number(values.creator)
                }
    try {
        let result = await createAmountInDB(amount)
        const type = await getTypeById(amount.type)
        result.type = {id:type.id,movement:type.movement,name:type.name,default:type.default}
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
        await deleteAmountByIdInDB(id)
        return amountToDelete
    } catch (error) {
        console.log(error)
        return
    }
}

const updateAmountById = async (values) => {
}

module.exports = {
    getAmountsByFilter,
    getAmountById,
    storeAmount,
    deleteAmountById,
    updateAmountById,
}
