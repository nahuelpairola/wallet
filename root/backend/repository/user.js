const { User } = require('../models')
const { NOT_ENOUGH_DATA } = require('../errors/error-msg-list')
const { 
    UserSearchError, 
    UserDeleteError, 
    UserCreateError, 
    UserUpdateError 
} = require('../errors/user-errors')

const renameUser = (user) => {
    // user.accountBalance = Number(user.accountBalance)
    return user
}

const getByEmail = async (email) => { 
    if(!email) throw new UserSearchError(NOT_ENOUGH_DATA)
    const where = {email:email}
    const user = await User.findOne({where,raw:true})
    if(!user) return null
    return renameUser(user)
}

const getById = async (id) => {
    if(!id) throw new UserSearchError(NOT_ENOUGH_DATA) 
    const user = await User.findByPk(id,{raw:true})
    if(user) return renameUser(user)
    else return null
}

const create = async (first_name,last_name,email,password,created_at,role) => {
    if( !first_name || !last_name || !email || !password || !created_at) throw new UserCreateError(NOT_ENOUGH_DATA)
    const result = await User.create({first_name,last_name,email,password,created_at,role})
    delete result.dataValues.password
    return renameUser(result)
}

const deleteById = async (id) => {
    if(!id) throw new UserDeleteError(NOT_ENOUGH_DATA)
    const userDeleted = await User.findByPk(id,{raw:true})
    delete userDeleted.password
    const where = {id}
    await User.destroy({where})
    return renameUser(userDeleted)
}

const updatePersonalData = async (id,first_name,last_name,email,password) => { 
    if( !id ||
        !first_name || 
        !last_name || 
        !email ||
        !password) throw new UserUpdateError(NOT_ENOUGH_DATA)
    const where = { id }
    const newValues = { first_name, last_name, email, password }
    await User.update(newValues,{where})
    const userUpdated = await User.findByPk(id,{raw:true})
    delete userUpdated.password // delete password element
    return renameUser(userUpdated)
}

const updateAccountBalance = async (id,accountBalance) => { 
    if( !id || typeof accountBalance === 'undefined' ) throw new UserUpdateError(NOT_ENOUGH_DATA)
    await User.update({accountBalance},{where:{id}})
    const userUpdated = await User.findByPk(id,{raw:true})
    delete userUpdated.password // delete password element
    return renameUser(userUpdated).accountBalance
}

module.exports = {
    create,
    getByEmail,
    getById,
    deleteById,
    updatePersonalData,
    updateAccountBalance,
}