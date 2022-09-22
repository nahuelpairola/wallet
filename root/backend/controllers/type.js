const {StatusCodes} = require('http-status-codes')
const {BadRequestError, NotFoundError, UnauthenticatedError} = require('../errors')

const { PROVIDE_ALL_DATA, TYPE_NOT_FOUND } = require('../errors/error-msg-list')

const {
    createNewType,
    getTypesByUser,
    deleteTypeByIdAndCreator,
    updateTypeByIdAndUser,
    assignDefaultTypeByCreatorRole,
    } = require('../services/type')

const createType = async (req, res) => {
    const {movement: movement, name: name} = req.body
    if(!movement || !name) throw new BadRequestError(PROVIDE_ALL_DATA)
    const creator = req.user
    const typeToCreate = {
        name:name,
        movement:movement,
        creator:creator.id,
        default: assignDefaultTypeByCreatorRole(creator.role)
    }
    const createdType = await createNewType(typeToCreate)
    res.status(StatusCodes.CREATED).json({User: creator.email, CreatedType: createdType})
}

const getTypes = async (req,res) => {
    const user = req.user
    const types = await getTypesByUser(user)
    if(!types) throw new NotFoundError(TYPE_NOT_FOUND)
    else res.status(StatusCodes.OK).json({ nHits: types.length, User: user.email, Types: types })
}

const deleteType = async (req,res) => {
    const {id:typeIdToDelete} = req.params
    if(!typeIdToDelete) throw new BadRequestError(PROVIDE_ALL_DATA)
    const user = req.user
    const deletedType = await deleteTypeByIdAndCreator({typeId:typeIdToDelete,creator:user})
    if(!deletedType) throw new NotFoundError(TYPE_NOT_FOUND)
    else res.status(StatusCodes.ACCEPTED).json({ User:user.email, DeletedType: deletedType })
}

const updateType = async (req, res) => {
    const { id: idOfTypeToUpdate } = req.params
    const { name: nameOfTypeToUpdate, movement: movementOfTypeToUpdate } = req.body
    if( !idOfTypeToUpdate || 
        !nameOfTypeToUpdate || 
        !movementOfTypeToUpdate) throw new BadRequestError(PROVIDE_ALL_DATA)
    const user = req.user
    const updatedType = await updateTypeByIdAndUser({
        id:idOfTypeToUpdate,
        name:nameOfTypeToUpdate,
        movement:movementOfTypeToUpdate,
        user:user
    })
    res.status(StatusCodes.OK).json({ User: user.email, UpdatedType: updatedType })
}

module.exports = {
    getTypes,
    createType,
    deleteType,
    updateType,
}