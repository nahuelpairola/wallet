
const {updateByIdAndValues, deleteByIdAndUser } = require('../services/user')
const {StatusCodes} = require('http-status-codes')

const updateUser = async (req,res) => {
    const {first_name, last_name, email, password} = req.body
    const {id: id} = req.params
    const user = req.user
    const values = {id, first_name, last_name, email, password} // values contains user id received in params
    const {user:userUpdated,token} = await updateByIdAndValues({id:user.id,values:values})
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'User created successful',
        data: {
            user:userUpdated,
        },
        token:token
    })
}

const deleteUser = async (req,res) => {
    const user = req.user
    const {id:userId} = req.params
    const {user:deletedUser,nTypes:nTypes,nAmounts:nAmounts} = await deleteByIdAndUser({id:userId, user:user})
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