
const { type } = require('ramda')
const {
    _createType,
    _deleteTypeById,
    _getTypeById,
    _getTypesCustomsByFilter,
    _getTypesByCreatorId,
    _updateTypeById,
    _getTypesDefaultByFilter,
} = require('../repository/type')

const getTypesByCreator = async (creator) => { 
    // returns all types, customs and defaults. If user is admin, returns only default types
    if(!creator.id) {
        return
    }
    if(creator.role === 'admin') {
        // only gets deafult types
        const types = await _getTypesDefaultByFilter()
        return types
    }
    // creator is a user
    try {
        const defaultTypes = await _getTypesDefaultByFilter()
        const customTypes = await _getTypesByCreatorId(creator.id)
        const types = []
        for(let i=0; i<defaultTypes.length;i++){
            types.push(defaultTypes[i])
        }
        for(let i=0; i<customTypes.length;i++){
            types.push(customTypes[i])
        }
        return types
    } catch (error) {
        console.log(error)
        return
    }
}

const storeType = async (values) => {
    if(!values.movement || !values.name || !values.creator.id) {
        return
    }
    const type = {
                movement: values.movement,
                name: values.name,
                created_at: new Date(),
                creator: values.creator.id
                }

    try {
        const filter = {movement:type.movement,name:type.name}
        const matchedType = await _getTypesDefaultByFilter(filter)
        if(matchedType && 
            (matchedType.movement === type.movement && matchedType.name === type.name)) {
            return matchedType
        }
        // type has different movement and name
        if(values.creator.role === 'admin') {
            type.default = true
            const createdType = await _createType(type)
            return createdType
        }
    } catch (error) {
        console.log(error)
        return 
    }
    // creator is user
    try {
        const filter = {movement:type.movement, name:type.name, creator:type.creator}
        const matchedType = await _getTypesCustomsByFilter(filter)
        if(matchedType && 
            (matchedType.movement === type.movement && matchedType.name === type.name)) {
            return matchedType
        }
        // type has different movement and name
        const createdType = await _createType(type)
        return createdType
    } catch (error) {
        console.log(error)
        return
    }

}

const getTypeByNameAndMovement = async (values) => {
    // the type can be a default or a custom one (this one must be of the creator)
    if(!values.name || !values.creator.id || !values.movement) {
        return
    }
    try {
        const type = await _getTypesDefaultByFilter({name:values.name,
                                                    movement:values.movement})
        if(type){
            return type[0]
        }
    } catch(error) {
        console.log(error)
        return
    }
    try {
        const type = await _getTypesCustomsByFilter({creator:values.creator.id,
                                                    name:values.name,
                                                    movement:values.movement})
        if(type) {
            return type[0]
        }
    } catch (error) {
        console.log(error)
        return
    }
    return
}

const getTypeIdByNameAndMovement = async (values) => {
    // the type can be a default or a custom one (this one must be of the creator)
    if(!values.name || !values.creator.id || !values.movement) {
        return
    }
    try {
        const type = await _getTypesDefaultByFilter({name:values.name,
                                                    movement:values.movement})
        if(type){
            return type[0].id
        }
    } catch(error) {
        console.log(error)
        return
    }
    try {
        const type = await _getTypesCustomsByFilter({creator:values.creator.id,
                                                    name:values.name,
                                                    movement:values.movement})
        if(type) {
            return type[0].id
        }
    } catch (error) {
        console.log(error)
        return
    }
    return
}

const getTypesByMovement = async (values) => {
    // the type can be a default or a custom one (this one must be of the creator)
    if(!values.creator.id || !values.movement) {
        return
    }
    try {
        const type = await _getTypesDefaultByFilter({movement:values.movement})
        if(type.length>0){
            return type
        }
    } catch(error) {
        console.log(error)
        return
    }
    try {
        const type = await _getTypesCustomsByFilter({creator:values.creator.id,
                                                    movement:values.movement})
        if(type.lenght>0) {
            return type
        }
    } catch (error) {
        console.log(error)
        return
    }
    return
}

const getTypeById = async (id) => {
    // the type can be a default or a custom one (this one must be of the creator)
    if(!id) {
        return
    }
    const filter = {id:id}

    try {
        const type = await _getTypeById({filter})
        if(type.length>0){
            return type
        }
    } catch(error) {
        console.log(error)
        return
    }
    return
}

const deleteTypeById = async (values) => { // requires creator
    if(!values.creator || !values.id) {
        return
    }
    // check if the type is not a default type
    const typeToDelete = await _getTypeById(values.id)
    if(typeToDelete.length>0) {
        if(typeToDelete[0].creator === values.creator.id) {
            try {
                const deletedType = await _deleteTypeById(values.id)
                return deletedType
            } catch (error) {
                console.log(error)
                return
            }
        }
    } else {
        return
    }
    return
}

module.exports = {
    
    getTypesByCreator,
    storeType,
    getTypeByNameAndMovement,
    getTypeIdByNameAndMovement,
    getTypesByMovement,
    getTypeById,
    deleteTypeById,
    // updateTypeById,
}

/*

const deleteTypeById = async (typeId) => {
    if(!typeId) {
        return
    }
    // check if the type is not a default type
    const typeToDelete = await getDataById(typeId)
    if(!typeToDelete) {
        return 
    }
    const deletedType = await deleteDataById(typeId)
    return deletedType
}

const getTypesByDefault = async () => { // admin types
    const defaultTypes = await getDataOfAdmin()
    return defaultTypes
}

const getTypeIdByName = async (values) => {
    if(!values.name || !values.creator) {
        return 
    }
    const filter = { name: values.name , creator: values.user.id }
    const type = await getData(filter)
    return (type.id)
}

const updateTypeById = async (values) => {
    if(!values.id || !values.name) {
        return
    }
    const typeToUpdate = await getDataById(values.id)
    if(!typeToUpdate) {
        return 
    }
    const updatedType = await updateDataById(values)
    return updatedType
}
 
*/