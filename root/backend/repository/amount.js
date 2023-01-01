
const { Op } = require('sequelize')
const {AmountCreateError, AmountSearchError, AmountUpdateError, AmountDeleteError} = require('../errors/amount-errors')
const { NOT_ENOUGH_DATA, AMOUNT_UPDATING_ERROR, AMOUNT_NOT_FOUND } = require('../errors/error-msg-list')
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
    // amount.quantity = Number(amount.quantity)
    return amount
}

const create = async (amountToCreate) => {
    if( !amountToCreate.quantity || 
        !amountToCreate.amountType || 
        !amountToCreate.creator || 
        !amountToCreate.created_at) throw new AmountCreateError(NOT_ENOUGH_DATA)
    const amount = await Amount.create(amountToCreate)
    return await getByIdAndCreator({id:amount.id,creator:amountToCreate.creator})
}

const getByIdAndCreator = async ({id,creator}) => {
    if(!id || !creator) throw new AmountSearchError(NOT_ENOUGH_DATA)
    const amount = await Amount.findOne({
        where:{id,creator},
        attributes: { exclude: ['amountType']},
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

const isAnAmountUsingThisTypeId = async (typeId) => { // type id
    if(!typeId) throw new AmountSearchError(NOT_ENOUGH_DATA)
    const count = await Amount.count({
        where:{amountType:typeId},
        raw:true,
        limit:1
    })
    return (count === 0 ? false : true)
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
            ['quantity','quantity'], // get amount quantity
            ['creator','creator'], // get amount creator
            ['created_at','created_at'], // get amount created_at
            [sequelize.literal('"type"."id"'), "typeId"], // type.id as typeId
            [sequelize.literal('"type"."name"'), "type"], // the types name will be type
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

const getByFilter = async ({creatorId,filteringOption}) => { // filter:{creatorId,filteringOption}
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

const deleteByIdAndCreator = async (id,creator) => {
    if(!creator || !id) throw new AmountDeleteError(NOT_ENOUGH_DATA)
    const where = {id,creator}
    const amount = await getByIdAndCreator({id,creator})
    if(!amount) throw AmountDeleteError(AMOUNT_NOT_FOUND) // amount can not be deleted
    const result = await Amount.destroy({where}) // destroy amount in db
    return (result === 1 ? amount : null)
}

const deleteAllByCreator = async (creator) => {
    if(!creator) throw new AmountDeleteError(NOT_ENOUGH_DATA)
    const result = await Amount.destroy({where:{creator}})
    return result
}

const updateAmountByIdCreatorAndValues = async ({id,creator,values}) => { // values contains: amount id, quantity and type id
    if( !id || !creator ||
        !values.quantity || 
        !values.amountType) throw new AmountUpdateError(NOT_ENOUGH_DATA)
    const where = {id,creator}
    const newValues = {
        quantity:values.quantity,
        amountType:values.amountType
    }
    const result = await Amount.update(newValues,{where})
    if(result[0] !== 1) throw new AmountUpdateError(AMOUNT_UPDATING_ERROR)
    return await getByIdAndCreator({id,creator})
}

module.exports = {
    create,
    getByIdAndCreator,
    isAnAmountUsingThisTypeId,
    getByFilter,
    deleteByIdAndCreator,
    deleteAllByCreator,
    updateAmountByIdCreatorAndValues,
}


