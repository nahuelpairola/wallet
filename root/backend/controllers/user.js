
const {updateByIdAndValues, deleteByIdAndUser } = require('../services/user')
const {StatusCodes} = require('http-status-codes')

const updateUser = async (req,res) => {
    const {first_name, last_name, email, password} = req.body
    const {id} = req.params
    const {user,token} = await updateByIdAndValues(req.user.id,{id, first_name, last_name, email, password})
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'User updated successful',
        data: {
            user,
        },
        token:token
    })
}

const deleteUser = async (req,res) => {
    const {id} = req.params
    const {user,nTypes,nAmounts} = await deleteByIdAndUser(id, req.user.id)
    res.status(StatusCodes.OK).json({
        success: true,
        message: "User deleted successful",
        data: {
            user:user,
            nTypes:nTypes,
            nAmounts:nAmounts,
        }
    })
}

const resetPassword = async (req,res) => {
    const {email} = req.body
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Password Reset Process',
        data:{}
    })
}

module.exports = {updateUser, deleteUser,resetPassword}