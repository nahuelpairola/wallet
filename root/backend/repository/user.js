const {User} = require('../models')

const getUserByEmail = async (email) => {
    if(!email) {
        return 
    }
    const where = {}
    where.email = email

    try {
        const user = await User.findAll({where})
        if(user.length>0) {
            return (user[0].dataValues)
        }
    } catch(error) {
        return
    }
}

const getUserById = async (id) => {
    if(!id) {
        return 
    }
    const where = {}
    if(id) {
        where.id = id
    }
    try {
        const user = await User.findAll({where})
        if(user.length>0) {
            return (user[0].dataValues)
        }
    } catch(error) {
        return
    }
}

const createUser = async (user) => {
    if(!user) {
        return
    }
    try {
        const result = await User.create(user)
        return result
    } catch(error) {
        console.log(error)
    }
}

const deleteUserById = async (id) => {
    if(!id){
        return
    }
    const where = {id:id}
    try{
        const user = await User.findAll({where})
        await User.destroy({where})
        return user
    } catch(error){
        console.log(error)
    }
}

const updateUserById = async (values) => { // values = {id,name}
    if(!values.id || !values.first_name || !values.last_name || !values.email) {
        return
    }
    const where = {id:values.id}
    try{
        await User.update({
                        first_name: values.first_name, 
                        last_name: values.last_name, 
                        email:values.email
                    },{where})
        const user = await User.findAll({where})
        return user
    } catch(error){
        console.log(error)
    }
}

module.exports = {
    createUser,
    getUserByEmail,
    getUserById,
    deleteUserById,
    updateUserById,
}