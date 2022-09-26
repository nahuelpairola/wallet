const { User } = require('../models')
const { NOT_ENOUGH_DATA } = require('../errors/error-msg-list')
const { UserSearchError, UserDeleteError, UserCreateError } = require('../errors/user-errors')

const getUserByEmailFromDB = async (userEmail) => {
    if(!userEmail) throw new UserSearchError(NOT_ENOUGH_DATA)
    const where = {email:userEmail}
    const user = await User.findAll({where,raw:true})
    if(!user) return null
    if(user.length>0) {
        return user[0]
    }
}

const getUserByIdFromDB = async (userId) => {
    if(!userId) throw new UserSearchError(NOT_ENOUGH_DATA) 
    const where = {id:userId}
    const user = await User.findAll({where,raw:true})
    if(user.length>0) {
        return user[0]
    }
}

const createUserInDB = async (user) => {
    if( !user.first_name||
        !user.last_name||
        !user.email||
        !user.password||
        !user.created_at) throw new UserCreateError(NOT_ENOUGH_DATA)
    const result = await User.create(user)
    return result
}

const deleteUserByIdInDB = async (userId) => {
    if(!userId) throw new UserDeleteError(NOT_ENOUGH_DATA)
    const where = {id:userId}
    const userDeleted = await User.findAll({where,raw:true})
    await User.destroy({where})
    return userDeleted
}

const updateUserByIdInDB = async (values) => { 
    if( !values.id ||
        !values.first_name || 
        !values.last_name || 
        !values.email) throw new UserSearchError(NOT_ENOUGH_DATA)
    const where = {id:values.id}
    const newValues = {
        first_name: values.first_name, 
        last_name: values.last_name, 
        email:values.email
    }
    await User.update(newValues,{where})
    const userUpdated = await User.findAll({where,raw:true})
    return userUpdated
}

module.exports = {
    createUserInDB,
    getUserByEmailFromDB,
    getUserByIdFromDB,
    deleteUserByIdInDB,
    updateUserByIdInDB,
}