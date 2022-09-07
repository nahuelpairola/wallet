const {StatusCodes} = require('http-status-codes')

const {
    storeType,
    getTypeById,
    getTypesByFilter,
    getTypesByCreatorId,
    deleteTypeById,
    updateTypeById,
    } = require('../services/type')

const createType = async (req, res) => {
    const {
        movement: movement,
        name: name,
    } = req.body
    if(!movement || !name) {
        res.status(StatusCodes.BAD_REQUEST).json({msg:'Please provide email and password'})
    }

    const creator = req.user
    const type = {name: name, movement: movement, creator: creator.id}

    if(creator.role === 'admin') type.default = true
    else type.default = false

    try {
        // returns the founded type or a new type
        const newType = await storeType(type)
        if(!newType) res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Cant create Amount'})
        else res.status(StatusCodes.CREATED).json({User: creator.email, CreatedType: newType})
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Cant create Amount'})
    }
}

const getTypes = async (req,res) => {
    const creator = req.user

    const filter = {}

    if(creator.role === 'admin') { // check if user = admin
        try { // only will return default types, all created by admin users
            filter.default = true
            const defaultTypes = await getTypesByFilter(filter)
            if(!defaultTypes) {
                res.status(StatusCodes.NOT_FOUND).json({msg:'Types not found'})
            } else {
                res.status(StatusCodes.OK).json({
                    nHits: defaultTypes.length, 
                    Admin: creator.email,
                    Types: defaultTypes 
                })
            }
        } catch(error){
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Error to get amount types'})
        }
    } else { // creator = user
        let types = []
        try {
            filter.default = true
            const defaultTypes = await getTypesByFilter(filter)
            if(!defaultTypes) {
                res.status(StatusCodes.NOT_FOUND).json({msg:'Types not found'})
            }

            const customTypes = await getTypesByCreatorId(creator.id) // get custom of that admin
            if(customTypes){ // is the user has custom types
                types = [...defaultTypes, ...customTypes]
                res.status(StatusCodes.OK).json({
                    nHits: types.length,
                    User: creator.email,
                    Types: types
                })
            }
            else {
                types = [...defaultTypes]
                res.status(StatusCodes.OK).json({ nHits: types.length, User: creator.email, Types: types })
            }
        } catch(error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Error to get amount types'})
        }
    }
}

const deleteType = async (req,res) => {
    const {id:id} = req.params
    if(!id){
        res.status(StatusCodes.BAD_REQUEST).json({msg:'No id'})
    }
    const creator = req.user
    if(creator.role === 'admin') { // can only delete default types no matters creator
        try { // check if type id and creator id are in the type to delete
            const typeToDelete = await getTypeById(id)
            if(typeToDelete) {
                if(typeToDelete.default === true) {
                    const deletedType = await deleteTypeById(id)
                    res.status(StatusCodes.OK).json({
                        User: creator.email,
                        DeletedType: deletedType
                    })
                } else {
                    res.status(StatusCodes.UNAUTHORIZED).json({
                        Admin: creator.email, 
                        msg:'The type is a custom one, not default'
                    })
                }
            } else {
                res.status(StatusCodes.NOT_FOUND).json({msg:'Type not found'})
            }
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Error to delete the data'})
        }
    } else { // creator = user, can ONLY delete own types
        try {
            const typeToDelete = await getTypeById(id)
            if(typeToDelete) {
                if(!typeToDelete.default && typeToDelete.creator === creator.id) { // check if the creator is user
                    const deletedType = await deleteTypeById(id)
                    res.status(StatusCodes.OK).json({
                        User: req.user.email,
                        DeletedType: deletedType
                    })
                } else {// can not able to access
                    res.status(StatusCodes.UNAUTHORIZED).json({msg:'Not able to delete the type'})
                }
            } else { // no type found
                res.status(StatusCodes.NOT_FOUND).json({msg:'Type not found'})
            }
        } catch (error){
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Error to delete the data'})
        }
    }
}

const updateType = async (req, res) => {
    const { id: id } = req.params
    if(!id) {
        res.status(StatusCodes.BAD_REQUEST).json({msg:'No id'})
    }
    const { name: name, movement: movement } = req.body
    if(!name || !movement) {
        res.status(StatusCodes.BAD_REQUEST).json({msg:'Please provide name and movement'})
    }
    const creator = req.user
    const newTypeValues = {id:id, name:name, movement:movement}
    if(creator.role === 'admin') { // can only update default types no matters creator
        try {
            const matchedType = await getTypeById(id)
            if(matchedType) {
                if(matchedType.default === true) {
                    const updatedType = await updateTypeById(newTypeValues)
                    if(!updatedType) res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Error to update the data'})
                    else {
                        res.status(StatusCodes.OK).json({
                            Admin: req.user.email,
                            UpdatedType: updatedType
                        })
                    }
                } else {
                    res.status(StatusCodes.UNAUTHORIZED).json({
                        Admin: creator.email, 
                        msg:'The type is a custom one, not default'
                    })
                } 
            } else { // type wasnt found
                res.status(StatusCodes.NOT_FOUND).json({msg:'Type not found'})
            }
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Error to update the data'})
        }
    } else { // normal user
        try {
            const typeMatched = await getTypeById(id)
            if(typeMatched) {
                if(typeMatched.default === false && typeMatched.creator === creator.id) { // check if the creator is user
                    const updatedType = await updateTypeById(newTypeValues)
                    if(!updatedType) res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Error to update the data'})
                    else {
                        res.status(StatusCodes.OK).json({
                            User: req.user.email,
                            Updatedype: updatedType
                        })
                    }
                }
                else { // can not able to access
                    res.status(StatusCodes.UNAUTHORIZED).json({msg:'Not able to delete the type'})
                }
            } else { // no type found
                res.status(StatusCodes.NOT_FOUND).json({msg:'Type not found'})
            }
        } catch (error) {
            // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:'Error to delete the data'})
            console.log(error);
        }
    }
}

module.exports = {
    getTypes,
    createType,
    deleteType,
    updateType,
}