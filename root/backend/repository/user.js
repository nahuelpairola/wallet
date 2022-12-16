const { User } = require('../models')
const { NOT_ENOUGH_DATA } = require('../errors/error-msg-list')
const { 
    UserSearchError, 
    UserDeleteError, 
    UserCreateError, 
    UserUpdateError 
} = require('../errors/user-errors')

const renameUser = (user) => {
    user.accountBalance = Number(user.accountBalance)
    return user
}

const getByEmail = async (email) => { // EX GETUSERBYEMAILFROMDB
    if(!email) throw new UserSearchError(NOT_ENOUGH_DATA)
    const where = {email:email}
    const user = await User.findOne({where,raw:true})
    if(!user) return null
    return renameUser(user)
}

const getById = async (userId) => {
    if(!userId) throw new UserSearchError(NOT_ENOUGH_DATA) 
    const user = await User.findByPk(userId,{raw:true})
    if(user) return renameUser(user)
    else return null
}

const create = async (user) => {
    if( !user.first_name||
        !user.last_name||
        !user.email||
        !user.password||
        !user.created_at) throw new UserCreateError(NOT_ENOUGH_DATA)
    const result = await User.create(user)
    delete result.password
    return renameUser(result)
}

const deleteById = async (userId) => {
    if(!userId) throw new UserDeleteError(NOT_ENOUGH_DATA)
    const where = {id: userId}
    const userDeleted = await User.findByPk(userId,{raw:true})
    await User.destroy({where})
    return renameUser(userDeleted)
}

const update = async (values) => { 
    if( !values.id ||
        !values.first_name || 
        !values.last_name || 
        !values.email ||
        !values.password) throw new UserUpdateError(NOT_ENOUGH_DATA)
    const where = { id:values.id }
    const newValues = {
        first_name: values.first_name, 
        last_name: values.last_name,
        email:values.email,
        password:values.password
    }
    await User.update(newValues,{where})
    const userUpdated = await User.findByPk(values.id,{raw:true})
    delete userUpdated.password // delete password element
    return renameUser(userUpdated)
}

const updateAccountBalanceById = async ({userId,accountBalance}) => {
    if(!userId || typeof accountBalance === 'undefined') throw new UserUpdateError(NOT_ENOUGH_DATA)
    const where = {id:userId}
    await User.update({accountBalance:accountBalance},{where})
    const userUpdated = await User.findByPk(userId)
    return renameUser(userUpdated)
}

module.exports = {
    create,
    getByEmail,
    getById,
    deleteById,
    update,
    updateAccountBalanceById,
}