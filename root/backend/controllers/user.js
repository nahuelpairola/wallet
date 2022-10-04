
const {updateUserByIdUserAndNewValuesAndGetUpdatedUserNewToken } = require('../services/user')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError} = require('../errors')
const { PROVIDE_ALL_DATA } = require('../errors/error-msg-list')

const updateUser = async (req,res) => {
    const {first_name, last_name, email, password} = req.body
    const {id: userIdToUpdate} = req.params

    if(!first_name || !last_name || !email || !password) throw new BadRequestError(PROVIDE_ALL_DATA)
    
    const user = req.user    
    const newValues = {first_name, last_name, email, password}

    const {updatedUser,token} = await updateUserByIdUserAndNewValuesAndGetUpdatedUserNewToken({id: userIdToUpdate, user:user, newValues})
    res.status(StatusCodes.OK).json({updatedUser, token})
}

const deleteUser = async (req,res) => {
    res.json('delete user')
}

module.exports = {updateUser, deleteUser}