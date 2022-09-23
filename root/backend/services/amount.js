
const { ServiceError, NotFoundError, UnauthenticatedError } = require('../errors')
const { NOT_ENOUGH_DATA, AMOUNT_CREATION_ERROR, TYPE_NOT_FOUND, PROVIDE_CORRECT_DATA, PROVIDE_CORRECT_DATA_AMOUNT_SEARCHING_ERROR, AMOUNT_DELETING_ERROR, AMOUNT_NOT_FOUND, AMOUNT_UPDATING_ERROR } = require('../errors/error-msg-list')
const {
    createAmountInDB,
    getAmountByIdFromDB,
    getAmountsByFilterFromDB,
    getAmountsByTypeIdFromDB,
    getAmountsByCreatorIdFromDB,
    deleteAmountByIdInDB,
    updateAmountByIdQuantityAndAmountTypeInDB,
} = require('../repository/amount')
const { isMovement } = require('../repository/type')

const { getTypesByMovementNameAndUserId } = require('../services/type')

const isDate = (date) => {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

const filterAmountsByCreationDate = (amounts,startAndOrEndCreationDatesString) => {
    // return array with start and end day, if exists
    if(!startAndOrEndCreationDatesString.includes(';')) throw new ServiceError(PROVIDE_CORRECT_DATA)
    let amountsToFilter = amounts
    startAndOrEndCreationDatesString.split(';').map((date,index) => {
        if(isDate(date)) {
            amountsToFilter = amountsToFilter.filter((amount) => {
                const amountCreationDate = new Date(amount.created_at)
                if(index === 0) return (amountCreationDate >= new Date(date))
                else return (amountCreationDate <= new Date(date))
            })
        }
    })
    return amountsToFilter
}

const isNumeric = (num) => (typeof(num) === 'number' || typeof(num) === "string" && num.trim() !== '') && !isNaN(num)

const filterAmountsByQuantity = (amounts,minAndOrMaxQuantityString) => {
    if(!minAndOrMaxQuantityString.includes(';')) throw new ServiceError(PROVIDE_CORRECT_DATA)
    let amountsToFilter = amounts
    minAndOrMaxQuantityString.split(';').map((quantity,index) => {
        if(isNumeric(quantity)) {
            amountsToFilter = amountsToFilter.filter((amount) => {
                const amountQuantity = Number(amount.quantity)
                if(index === 0) return (amountQuantity >= Number(quantity))
                else return (amountQuantity <= Number(quantity))
            })
        }
    })
    return amountsToFilter
}

const filterAmountsByMovement = (amounts,movementString) => {
    let amountsToFilter = amounts
    if(isMovement(movementString)) {
        amountsToFilter = amountsToFilter.filter(amount => {
            return (amount.movement === movementString)
        })
    }
    return amountsToFilter
}

const filterAmountsByTypes = (amounts,typesString) => {
    let amountsToFilter = amounts
    const types = typesString.split(',')
    types.forEach((type)=>{
        amountsToFilter = amountsToFilter.filter(amount => {
            return (amount.type === type)
        })
    })
    return amountsToFilter
}

const getAmountsByCreatorIdWithFilteringOption = async ({creatorId,filteringOption}) => {
    if(!creatorId) throw new ServiceError(PROVIDE_CORRECT_DATA_AMOUNT_SEARCHING_ERROR)

    let amountsToProcess = await getAmountsByCreatorIdFromDB(creatorId)

    if(filteringOption.created_at) { // check if there are creation dates to filter
         // format -> <startDate>;<endDate>
        amountsToProcess = filterAmountsByCreationDate(amountsToProcess,filteringOption.created_at)
    }

    if(filteringOption.quantity) { // checking if there are quantites to filter
        // format -> <minQuantity>;<maxQuantity>
        amountsToProcess = filterAmountsByQuantity(amountsToProcess,filteringOption.quantity)
    }

    if(filteringOption.movement) {
        // format -> 'input' or 'output'
        amountsToProcess = filterAmountsByMovement(amountsToProcess,filteringOption.movement)
    }

    if(filteringOption.type) {
        // format -> <typeName1>,<typeName2>,...,<typeNameX>
        amountsToProcess = filterAmountsByTypes(amountsToProcess,filteringOption.type)
    }

    return amountsToProcess
}

const getAmountById = async (amountId) => {
    if(!amountId) throw new ServiceError(NOT_ENOUGH_DATA)
    const amount = await getAmountByIdFromDB(amountId)
    return amount
}

const createAmountByQuantityMovementTypeAndCreatorId = async (values) => {
    if( !values.quantity || 
        !values.movement || 
        !values.type ||
        !values.creatorId ) throw new ServiceError(NOT_ENOUGH_DATA)

    // check if the type (movement and name) is a default one or its a custom one and belongs to the user
    const typeMatched = await getTypesByMovementNameAndUserId({movement:values.movement,name:values.type,userId:values.creatorId})
    if(!typeMatched) throw new NotFoundError(TYPE_NOT_FOUND+', '+AMOUNT_CREATION_ERROR)
    
    const amountToCreate = {
        quantity: Number(values.quantity),
        amountType: Number(typeMatched.id),
        creator: Number(values.creatorId),
        created_at: new Date(),
    }
    
    const amountCreated = await createAmountInDB(amountToCreate)
    if(!amountCreated) throw new ServiceError(AMOUNT_CREATION_ERROR)
    else return amountCreated
}

const deleteAmountByIdAndCreatorId = async ({amountId,creatorId}) => {
    if(!amountId || !creatorId) throw new ServiceError(NOT_ENOUGH_DATA)
    const amountToDelete = await getAmountById(amountId)
    if(!amountToDelete || amountToDelete.creator !== creatorId) throw new ServiceError(AMOUNT_DELETING_ERROR)   
    const amountDeleted = await deleteAmountByIdInDB(amountId)
    return amountDeleted 
}

const updateAmountByIdAndNewValues = async ({amountId,newValues:{quantity,amountType}}) => {
    if(!amountId || !quantity || !amountType) throw new ServiceError(NOT_ENOUGH_DATA)
    const amountUpdated = await updateAmountByIdQuantityAndAmountTypeInDB({id:amountId,quantity,amountType})
    if(!amountUpdated) return null
    else return amountUpdated
}

const updateAmountByIdCreatorIdAndNewValues = async ({amountId, creatorId, newValues: {quantity, movement, type}}) => {
    if( !amountId || !creatorId || !quantity || !movement || !type) throw new ServiceError(NOT_ENOUGH_DATA)
    const amountMatched = await getAmountById(amountId)
    if(!amountMatched) throw new NotFoundError(AMOUNT_NOT_FOUND+', '+AMOUNT_UPDATING_ERROR)
    if(amountMatched.creator !== creatorId) throw new UnauthenticatedError(AMOUNT_UPDATING_ERROR)
    // check if the type (movement and name) is a default one OR is a custom one
    const newType = await getTypesByMovementNameAndUserId({movement, name: type, userId:creatorId})
    if(!newType) throw new NotFoundError(TYPE_NOT_FOUND+', '+AMOUNT_UPDATING_ERROR)
    const amountUpdated = await updateAmountByIdAndNewValues({amountId,newValues:{quantity,amountType:newType.id}})
    if(!amountUpdated) throw new ServiceError(AMOUNT_UPDATING_ERROR)
    else return amountUpdated
}

module.exports = {
    getAmountsByCreatorIdWithFilteringOption,
    createAmountByQuantityMovementTypeAndCreatorId,
    deleteAmountByIdAndCreatorId,
    updateAmountByIdCreatorIdAndNewValues,
}
