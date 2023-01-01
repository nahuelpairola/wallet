const {StatusCodes} = require('http-status-codes')

const { getByCreatorIdAndFilteringOption,
        create,
        deleteByIdAndCreatorId,
        updateByIdCreatorAndValues,
    } = require('../services/amount')

const createAmount = async (req,res) => {
    const { quantity, movement, type, created_at } = req.body
    const amount = await create({ quantity, movement, type, creator:req.user.id, created_at })
    res.status(StatusCodes.CREATED).json({
        success: true,
        msg: "Amount created successful",
        data: null,
    })
}

const getAmounts = async (req,res) => {
    const {
        quantity,
        created_at,
        movement,
        type,
        join, // join types or join movements
        page,
        limit,
    } = req.query
    const creator = req.user
    const filteringOption = {quantity,created_at,movement,type,join,page,limit}
    const data = await getByCreatorIdAndFilteringOption({
        creatorId:creator.id,
        filteringOption
    })
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Amounts searching successful",
        pagination: data.pagination,
        data: {
            accountBalance: data.accountBalance,
            amounts: data.amounts
        },
    })
}

const deleteAmount = async (req,res) => {
    const {id} = req.params
    const creator = req.user
    await deleteByIdAndCreatorId({id, creatorId:creator.id})
    res.status(StatusCodes.OK).json({
        success: true,
        msg: "Amount deleted successful",
        data: null
    })
}

const updateAmount = async (req,res) => {
    const {id} = req.params
    const {quantity,movement,type} = req.body
    const creator = req.user
    const amount = await updateByIdCreatorAndValues({
        id: id,
        creator: creator.id,
        values: {quantity,movement,type}
    })
    res.status(StatusCodes.OK).json({
        success: true,
        msg: "Amount updated successful",
        data: {
           amount: amount,
        }
    })
}

module.exports = {
    getAmounts,
    createAmount,
    deleteAmount,
    updateAmount
}