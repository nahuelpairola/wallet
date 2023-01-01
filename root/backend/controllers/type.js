const {StatusCodes} = require('http-status-codes')

const {
    createNewType,
    getAllByCreator,
    deleteByIdAndCreator,
    updateByIdCreatorAndName,
    } = require('../services/type')

const createType = async (req, res) => {
    const {movement: movement, name: name} = req.body
    const creator = req.user
    const type = {
        name:name,
        movement:movement,
        creator:creator.id,
        default: creator.role === 'admin' ? true : false
    }
    const createdType = await createNewType(type)
    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Type created successful',
        data: {
            type: createdType
        }
    })
}

const getTypes = async (req,res) => {
    const user = req.user
    const types = await getAllByCreator(user.id)
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Types searched successful',
        data:{
            types: types
        }
    })
}

const deleteType = async (req,res) => {
    const {id:id} = req.params
    const user = req.user
    await deleteByIdAndCreator({id:id,creator:user.id})
    res.status(StatusCodes.ACCEPTED).json({
        success:true,
        message:'Type deleted successful',
        data:null
    })
}

const updateType = async (req, res) => {
    const { id: id } = req.params
    const { name: name } = req.body
    const user = req.user
    const updatedType = await updateByIdCreatorAndName({
        id:id,
        creator:user.id,
        name:name
    })
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Type updated successful',
        data:{
            type: updatedType
        }
    })
}

module.exports = {
    getTypes,
    createType,
    deleteType,
    updateType,
}