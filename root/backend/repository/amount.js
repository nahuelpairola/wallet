
const { Op } = require('sequelize')
const {AmountCreateError, AmountSearchError, AmountUpdateError, AmountDeleteError} = require('../errors/amount-errors')
const { NOT_ENOUGH_DATA } = require('../errors/error-msg-list')
const { Amount, User, Type} = require('../models')
const { sequelize } = require('../db/connect')

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

const getWhereForAmountByCreatorIdAndFilteringOption = ({creatorId,filteringOption}) => {
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
    return where
}

const getWhereForTypeByFilteringOption = (filteringOption) => {
    const where = {}
    if(filteringOption.type) {
        where.name = {[Op.or]:filteringOption.type.map((type)=>type)}
    }
    if(filteringOption.movement) {where.movement = {[Op.eq]:filteringOption.movement}}
    return where
}

const getFindAllOptionByWhereForAmountWhereForTypeAndJoin = ({whereForAmount,whereForType,join}) => {
    let option = {
        where:whereForAmount,
        raw:true,
        attributes:[],
        include: {
            model:Type,
            where: whereForType,
            attributes: []
        }
    }
    if(!join) {
        option.attributes = [
            ['id','id'], // get amount id
            ['creator','creator'], // get amount creator
            ['created_at','created_at'], // get amoiunt created_at
            [sequelize.literal('"type"."id"'), "typeId"], // rename type.id to typeId
            [sequelize.literal('"type"."name"'), "type"], // the type name will be type
            [sequelize.literal('"type"."movement"'), "movement"], // type movement as movement
            [sequelize.literal('"type"."default"'), "default"], // type default as default
        ]
        option.order = [['created_at', 'DESC'],['id','DESC']]
        return option
    }
     // join = type or = movement
    if(join === 'type') {
        option.attributes = [
            [sequelize.fn("SUM", sequelize.col("quantity")), "quantity"],
            ['creator','creator'],
            ['amountType','typeId'],
            [sequelize.literal('"type"."name"'), "type"], // the type name will be type
            [sequelize.literal('"type"."movement"'), "movement"], // type movement as movement
            [sequelize.literal('"type"."default"'), "default"], // type default as default
        ]
        option.group = ["amounts.creator","default","movement","type","typeId"]
        return option
    }
    if(join === 'movement') {
        option.attributes = [
            [sequelize.fn("SUM", sequelize.col("quantity")), "quantity"],
            ['creator','creator'],
            [sequelize.literal('"type"."movement"'), "movement"], // type movement as movement
        ]
        option.group = ["amounts.creator","movement"]
        return option
    }
}

const getPaginationByLimitActualPageAndCountAmounts = ({limit,actualPage,countAmounts}) => {
    let pagination = {
        current_page: actualPage,
        next_page:null,
        previous_page:null,
        total_pages: null,
        per_page: limit,
    }
    // calculate total_pages
    if(countAmounts % pagination.per_page !== 0) pagination.total_pages = Math.floor(countAmounts/limit)+1  
    else pagination.total_pages = Math.floor(countAmounts/limit)
    // calculate next and previous page
    pagination.previous_page = pagination.current_page - 1
    if(pagination.current_page===1) pagination.previous_page = null
    pagination.next_page = pagination.current_page + 1
    if(pagination.current_page === pagination.total_pages) {
        pagination.current_page = pagination.total_pages
        pagination.next_page = null
    }
    return pagination
}

const getAmountsByCreatorIdAndFilteringOptionFromDB = async ({creatorId,filteringOption}) => {
    if(!creatorId) throw new AmountSearchError(NOT_ENOUGH_DATA)
    const whereForAmount = getWhereForAmountByCreatorIdAndFilteringOption({creatorId,filteringOption})
    const whereForType = getWhereForTypeByFilteringOption(filteringOption)
    const findAllAmountsOptions = getFindAllOptionByWhereForAmountWhereForTypeAndJoin({whereForAmount,whereForType,join:filteringOption.join})
    findAllAmountsOptions.limit = filteringOption.limit
    findAllAmountsOptions.offset = (filteringOption.page-1)*filteringOption.limit
    let result = null, pagination = null
    if(!filteringOption.join) {
        result = await Amount.findAndCountAll(findAllAmountsOptions)
        pagination = getPaginationByLimitActualPageAndCountAmounts({
            limit:filteringOption.limit,
            actualPage:filteringOption.page,
            countAmounts:result.count
        })
    } else {
        result = await Amount.findAll(findAllAmountsOptions)
        pagination = getPaginationByLimitActualPageAndCountAmounts({
            limit:filteringOption.limit,
            actualPage:filteringOption.page,
            countAmounts:result.length
        })
    }
    return {
        pagination:pagination,
        amounts:result.rows || result
    }
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
    // countAmountsByCreatorIdAndFilteringOptionFromDB,
    getAmountsByCreatorIdAndFilteringOptionFromDB,
    deleteAmountByIdInDB,
    updateAmountByIdQuantityAndAmountTypeInDB,
}


