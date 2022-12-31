
const { getByEmailAndPassword , register} = require('../services/user')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError} = require('../errors')
const { PROVIDE_ALL_DATA } = require('../errors/error-msg-list')

const login = async (req, res) => {
    const {email, password} = req.body
    if(!email || !password) throw new BadRequestError(PROVIDE_ALL_DATA)
    const {user,token} = await getByEmailAndPassword({email:email, password:password})
    res.status(StatusCodes.ACCEPTED).json({
        success: true,
        message: "Login successful",
        data: {
            user: user
        },
        token: token
    })
}

const registration = async (req, res) => {
    const {first_name, last_name, email, password, role} = req.body
    if(!first_name || !last_name || !email || !password) throw new BadRequestError(PROVIDE_ALL_DATA)
    const userData = {first_name, last_name, email, password}
    if(role) userData.role = role
    const {user,token} = await register(userData)
    res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Registration successful",
        data:{
            user:user,
        },
        token:token,
    })
}

module.exports = {login, registration}