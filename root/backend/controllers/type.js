const {StatusCodes} = require('http-status-codes')
const {NotFoundError} = require('../errors')

const { TYPE_NOT_FOUND } = require('../errors/error-msg-list')

const {
    createNewType,
    getTypesByUserIdAndRole,
    deleteTypeByIdAndCreator,
    updateTypeByIdAndUser,
    assignDefaultTypeByCreatorRole,
    } = require('../services/type')

const createType = async (req, res) => {
    const {movement: movement, name: name} = req.body
    const creator = req.user
    const typeToCreate = {
        name:name,
        movement:movement,
        creator:creator.id,
        default: assignDefaultTypeByCreatorRole(creator.role)
    }
    const createdType = await createNewType(typeToCreate)
    res.status(StatusCodes.CREATED).json({user: {id:creator.id,email:creator.email}, createdType: createdType, msg: "TYPE CREATED SUCCESSFUL"})
}

const getTypes = async (req,res) => {
    const user = req.user
    const types = await getTypesByUserIdAndRole({id:user.id, role:user.role})
    if(!types) throw new NotFoundError(TYPE_NOT_FOUND)
    else res.status(StatusCodes.OK).json({ user: {id:user.id,email:user.email}, nTypes: types.length, types: types , msg: "TYPES SEARCHING SUCCESSFUL"})
}

const deleteType = async (req,res) => {
    const {id:typeIdToDelete} = req.params
    const user = req.user
    const deletedType = await deleteTypeByIdAndCreator({typeId:typeIdToDelete,creator:user})
    res.status(StatusCodes.ACCEPTED).json({ user: {id: user.id, email: user.email}, deletedType: deletedType, msg: "TYPE DELETED SUCCESSFUL"})
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