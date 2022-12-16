const {StatusCodes} = require('http-status-codes')
const {NotFoundError} = require('../errors')

const { TYPE_NOT_FOUND } = require('../errors/error-msg-list')

const {
    createNewType,
    getTypesByCreator,
    deleteByIdAndCreator,
    updateTypeByIdAndUser,
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
    const types = await getTypesByCreator(user.id)
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Types searched successful',
        data:{
            nTypes: types.length,
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
        data:{}
    })
}

const updateType = async (req, res) => {
    const { id: idOfTypeToUpdate } = req.params
    const { name: nameOfTypeToUpdate, movement: movementOfTypeToUpdate } = req.body
    const user = req.user
    const updatedType = await updateTypeByIdAndUser({
        id:idOfTypeToUpdate,
        name:nameOfTypeToUpdate,
        movement:movementOfTypeToUpdate,
        user:user
    })
    res.status(StatusCodes.OK).json({ user: {id: user.id, email: user.email}, updatedType: updatedType, msg: "TYPE UPDATED SUCCESSFUL"})
}

module.exports = {
    getTypes,
    createType,
    deleteType,
    updateType,
}