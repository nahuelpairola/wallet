
const { Op } = require('sequelize')
const {AmountCreateError, AmountSearchError, AmountUpdateError, AmountDeleteError} = require('../errors/amount-errors')
const { NOT_ENOUGH_DATA } = require('../errors/error-msg-list')
const { Amount, User, Type} = require('../models')

const renameSingleAmount = (amount) => {    
    delete amount['user.id']
    if(amount['user.id']){
    }
    if(amount['type.id']){
        amount.typeId = amount['type.id']
        delete amount['type.id']
    }
    if(amount['type.movement']){
        amount.movement = amount['type.movement']
        delete amount['type.movement']
    }
    if(amount['type.name']){
        amount.type = amount['type.name']
        delete amount['type.name']
    }        
    if(typeof amount['type.default'] !== 'undefined'){
        amount.default = amount['type.default']
        delete amount['type.default']
    }
    amount.quantity = Number(amount.quantity)        
    return amount
}

const renameAmounts = (amounts) => { // rename elements in amounts, a single one or an array
    const renamedAmounts = amounts.map( (amount) => {
        return renameSingleAmount(amount) // rename single amount
    })
    return renamedAmounts
}

const createAmountInDB = async (amountToCreate) => {
    if( !amountToCreate.quantity || 
        !amountToCreate.amountType || 
        !amountToCreate.creator || 
        !amountToCreate.created_at) throw new AmountCreateError(NOT_ENOUGH_DATA)
    const amount = await Amount.create(amountToCreate)
    const amountCreated = await getAmountByIdFromDB(amount.dataValues.id)
    return amountCreated
}

const getAmountByIdFromDB = async (amountId) => {
    if(!amountId) throw new AmountSearchError(NOT_ENOUGH_DATA)
    const amount = await Amount.findByPk(amountId,{
        attributes: { exclude: ['amountType'] },
        raw:true,
        include: { 
            all: true,
            attributes: {exclude:['first_name','last_name','email','role','password','created_at','creator','accountBalance']}
        }
    })
    if(!amount) return null
    else {
        const renamedAmount = renameSingleAmount(amount)
        return renamedAmount
    }
}

const getAtLeastOneAmountUsingThisTypeIdInDB = async (typeId) => { // type id
    if(!typeId) throw new AmountSearchError(NOT_ENOUGH_DATA)
    const where = {amountType:typeId}
    const singleAmount = await Amount.findOne({
        where, 
        attributes: { exclude: ['amountType'] },
        raw:true,
        include: { 
            all: true,
            attributes: {exclude:['first_name','last_name','email','role','password','created_at','creator','accountBalance']}
        }
    })
    if(!singleAmount) return null
    else {
        const renamedAmount = renameSingleAmount(singleAmount)
        return renamedAmount
    }
}

const countAllAmountsByWhereForAmountAndWhereForType = async ({whereForAmount, whereForType}) => {
    const countAllAmounts = await Amount.count({
        whereForAmount,
        raw:true,
        include: [{
            model:Type,
            where: whereForType
        },{
            model:User
        }]
    })
    return countAllAmounts
}

const calculateNumberOfPagesByCountAllAmounts = (countAllAmounts) => {
    if(!countAllAmounts) throw new AmountSearchError(NOT_ENOUGH_DATA)
    // 50 amounts per page
    if(countAllAmounts % 50 !== 0) return (Math.floor(countAllAmounts/50)+1)  
    else return Math.floor(countAllAmounts/50)
}

const getAmountsCountAllAmountsAndNumberOfPagesByCreatorIdAndFilteringOptionFromDB = async ({creatorId,filteringOption}) => {
    if(!creatorId) throw new AmountSearchError(NOT_ENOUGH_DATA)
    const where = {creator:creatorId}
    if(filteringOption.quantity) {
        where.quantity = {}
        if(filteringOption.quantity[0] !== '') where.quantity[Op.gte] = filteringOption.quantity[0]
        if(filteringOption.quantity[1] !== '') where.quantity[Op.lte] = filteringOption.quantity[1]
    }
    if(filteringOption.created_at) {
        where.created_at = {}
        if(filteringOption.created_at[0] !== '') where.created_at[Op.gte] = filteringOption.created_at[0]
        if(filteringOption.created_at[1] !== '') where.created_at[Op.lte] = filteringOption.created_at[1]
    }
    const whereForType = {}
    if(filteringOption.type) {
        whereForType.name = {[Op.or]:filteringOption.type.map((type)=>type)}
    }
    if(filteringOption.movement) {whereForType.movement = {[Op.eq]:filteringOption.movement}}

    const countAllAmounts = await countAllAmountsByWhereForAmountAndWhereForType({whereForAmount:where,whereForType:whereForType})

    const amounts = await Amount.findAll({
        where,
        attributes: {
            exclude: ['amountType'],
        },
        raw:true,
        include: [{
            model:Type,
            where: whereForType,
            attributes: {
                exclude:['creator','created_at']
            }
        },{
            model:User,
            attributes: {
                exclude:['first_name','last_name','email','role','password','created_at','accountBalance']
            }
        }],
        order: [['created_at', 'DESC']],
        limit: 50,
        offset: (filteringOption.page-1)*50
    })
    const renamedAmounts = renameAmounts(amounts)
    const numberOfPages = calculateNumberOfPagesByCountAllAmounts(countAllAmounts)
    return {amounts:renamedAmounts,countAllAmounts,numberOfPages}
}

const deleteAmountByIdInDB = async (amountId) => {
    if(!amountId) throw new AmountDeleteError(NOT_ENOUGH_DATA)
    const amountDeleted = await getAmountByIdFromDB(amountId)
    const where = {id:amountId}
    await Amount.destroy({where}) // destroy amount in db
    return amountDeleted
}

const updateAmountByIdQuantityAndAmountTypeInDB = async (values) => { // values contains: amount id, quantity and type id
    if( !values.id || 
        !values.quantity || 
        !values.amountType) throw new AmountUpdateError(NOT_ENOUGH_DATA)
    const where = {id: values.id}
    const newValues = {
        quantity:values.quantity,
        amountType:values.amountType
    }
    await Amount.update(newValues,{where})
    const renamedAmount = await getAmountByIdFromDB(values.id)
    return renamedAmount
}

module.exports = {
    createAmountInDB,
    getAmountByIdFromDB,
    getAtLeastOneAmountUsingThisTypeIdInDB,
    getAmountsCountAllAmountsAndNumberOfPagesByCreatorIdAndFilteringOptionFromDB,
    deleteAmountByIdInDB,
    updateAmountByIdQuantityAndAmountTypeInDB,
}