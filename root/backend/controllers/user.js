
const {updateUserByIdUserAndNewValuesGetEmailAndNewToken, deleteUserByIdAndUser } = require('../services/user')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError} = require('../errors')
const { PROVIDE_ALL_DATA } = require('../errors/error-msg-list')

const updateUser = async (req,res) => {
    const {first_name, last_name, email, password} = req.body
    const {id: userIdToUpdate} = req.params

    if(!first_name || !last_name || !email || !password) throw new BadRequestError(PROVIDE_ALL_DATA)
    
    const user = req.user    
    const newValues = {first_name, last_name, email, password}

    const {email:newEmail,token:newToken} = await updateUserByIdUserAndNewValuesGetEmailAndNewToken({id: userIdToUpdate, user:user, newValues})
    res.status(StatusCodes.OK).json({User:newEmail, Token:newToken})
}

const deleteUser = async (req,res) => {
    const user = req.user
    const {id:userId} = req.params
    const {user:deletedUser,nTypes:nTypes,nAmounts:nAmounts} = await deleteUserByIdAndUser({id:userId, user:user})
    res.status(StatusCodes.OK).json({User:deletedUser.email,nTypes:nTypes,nAmounts:nAmounts})
}

module.exports = {updateUser, deleteUser}