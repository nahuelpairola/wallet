
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
    const {user:deletedUser,nTypes:nTypes,nAmounts:nAmounts} = await deleteByIdAndUser(id, req.user.id)
    res.status(StatusCodes.OK).json({
        success: true,
        message: "User deleted successful",
        data: {
            user:deletedUser,
            nTypes:nTypes,
            nAmounts:nAmounts,
        }
    })
}

module.exports = {updateUser, deleteUser}