const { User } = require('../models')

const getUserByEmailFromDB = async (userEmail) => {
    if(!userEmail) return null
    const where = {email:userEmail}
    const user = await User.findAll({where,raw:true})
    if(!user) {
        return null
    }
    if(user.length>0) {
        return user[0]
    }
    return null
}

const getUserByIdFromDB = async (userId) => {
    if(!userId) return 
    const where = {id:userId}
    try {
        const user = await User.findAll({where,raw:true})
        if(user.length>0) {
            return user[0]
        }
    } catch(error) {
        console.log(error)
        return
    }
}

const createUserInDB = async (user) => {
    if(!user.first_name||!user.last_name||!user.email||!user.password||!user.created_at) {
        return
    }
    try {
        const result = await User.create(user)
        return result
    } catch(error) {
        console.log(error)
        return
    }
}

const deleteUserByIdInDB = async (userId) => {
    if(!userId) return
    const where = {id:userId}
    try{
        const userDeleted = await User.findAll({where,raw:true})
        await User.destroy({where})
        return userDeleted
    } catch(error){
        console.log(error)
        return
    }
}

const updateUserByIdInDB = async (values) => { 
    if(!values.id || !values.first_name || !values.last_name || !values.email) {
        return
    }
    const where = {id:values.id}
    const newValues = {
        first_name: values.first_name, 
        last_name: values.last_name, 
        email:values.email
    }
    try{
        await User.update(newValues,{where})
        const userUpdated = await User.findAll({where,raw:true})
        return userUpdated
    } catch(error){
        console.log(error)
        return
    }
}

module.exports = {
    createUserInDB,
    getUserByEmailFromDB,
    getUserByIdFromDB,
    deleteUserByIdInDB,
    updateUserByIdInDB,
}