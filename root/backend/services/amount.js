
const { ServiceError } = require('../errors')
const { NOT_ENOUGH_DATA, AMOUNT_CREATION_ERROR, AMOUNT_SEARCHING_ERROR, AMOUNT_DELETING_ERROR } = require('../errors/error-msg-list')
const {
    createAmountInDB,
    getAmountByIdFromDB,
    getAmountsByFilterFromDB,
    getAmountsByTypeIdFromDB,
    getAmountsByCreatorIdFromDB,
    deleteAmountByIdInDB,
    updateAmountValuesInDB,
} = require('../repository/amount')

const {
    isMovement,
    getTypeById
} = require('../services/type')

const getAmountsByFilterWithCreatorId = async (values) => {
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

    if(values.amountType) {
        const types = (values.amountType).split(',')
        types.forEach((type)=>{
            data = data.filter(amount => {
                return (amount['type.name'] === type)
            })
        })
    }

    return data
}

const getAmountById = async (amountId) => {
    if(!amountId) throw new ServiceError(NOT_ENOUGH_DATA)
    try {
        const amount = await getAmountByIdFromDB(amountId)
        return amount
    } catch (error) {
        throw new ServiceError(AMOUNT_SEARCHING_ERROR,error)
    }
}

const storeAmount = async (values) => {
    if( !values.quantity || 
        !values.amountType || 
        !values.creator) throw new ServiceError(NOT_ENOUGH_DATA)

    const amountToCreate = {
        quantity:Number(values.quantity),
        amountType: Number(values.amountType),
        created_at: new Date(),
        creator:Number(values.creator)
    }
    try {
        const amountCreated = await createAmountInDB(amountToCreate)
        return amountCreated
    } catch(error) {
        throw new ServiceError(AMOUNT_CREATION_ERROR,error)
    }
}

const deleteAmountById = async (id) => {
    if(!id) throw new ServiceError(NOT_ENOUGH_DATA)
    try {
        const amountToDelete = await getAmountByIdFromDB(id)
        await deleteAmountByIdInDB(id)
        return amountToDelete
    } catch (error) {
        throw new ServiceError(AMOUNT_DELETING_ERROR,error)
    }
}

const updateAmountById = async (values) => {
    console.log(values);
    return
}

module.exports = {
    getAmountsByFilterWithCreatorId,
    getAmountById,
    storeAmount,
    deleteAmountById,
    updateAmountById,
    isMovement,
}
