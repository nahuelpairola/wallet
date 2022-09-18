
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
    getTypeById
} = require('../services/type')

const getAmountsByFilterWithCreatorId = async (values) => {
    if(!values.creator) return
    const filter = { // create filter object
        creator:values.creator
    }
    let data = null // where goes the amounts data
    data = await getAmountsByCreatorIdFromDB(values.creator)

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
    const amount = await getAmountByIdFromDB(amountId)
    return amount
}

const createNewAmount = async (values) => {
    if( !values.quantity || 
        !values.amountType || 
        !values.creator) throw new ServiceError(NOT_ENOUGH_DATA)

    const amountToCreate = {
        quantity:Number(values.quantity),
        amountType: Number(values.amountType),
        created_at: new Date(),
        creator:Number(values.creator)
    }
    const amountCreated = await createAmountInDB(amountToCreate)
    if(!amountCreated) throw new ServiceError(AMOUNT_CREATION_ERROR)
    else return amountCreated
}

const deleteAmountById = async (idOfAmountToDelete) => {
    if(!idOfAmountToDelete) throw new ServiceError(NOT_ENOUGH_DATA)
    const amountToDelete = await getAmountByIdFromDB(idOfAmountToDelete)
    if(!amountToDelete) {}
    else {
        const amountDeleted = await deleteAmountByIdInDB(idOfAmountToDelete)
        return amountDeleted
    }
}

const updateAmountById = async (values) => {
    console.log(values);
    return
}

module.exports = {
    getAmountsByFilterWithCreatorId,
    getAmountById,
    createNewAmount,
    deleteAmountById,
    updateAmountById,
}
