
const {updateUserByIdUserAndNewValuesGetUserAndNewToken, deleteUserByIdAndUser } = require('../services/user')
const {StatusCodes} = require('http-status-codes')

const updateUser = async (req,res) => {
    const {first_name, last_name, email, password} = req.body
    const {id: userIdToUpdate} = req.params
    const user = req.user    
    const newValues = {first_name, last_name, email, password}
    const {user:userUpdated,token:newToken} = await updateUserByIdUserAndNewValuesGetUserAndNewToken({id: userIdToUpdate, user:user, newValues})
    res.status(StatusCodes.OK).json({user:{id:userUpdated.id,email:userUpdated.email}, token:newToken, msg: "USER UPDATED SUCCESSFUL"})
}

const deleteUser = async (req,res) => {
    const user = req.user
    const {id:userId} = req.params
    const {user:deletedUser,nTypes:nTypes,nAmounts:nAmounts} = await deleteUserByIdAndUser({id:userId, user:user})
    res.status(StatusCodes.OK).json({user:deletedUser.email,nTypes:nTypes,nAmounts:nAmounts, msg: "USER DATA DELETED SUCCESSFUL"})
}

module.exports = {updateUser, deleteUser}