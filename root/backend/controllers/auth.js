
const { createUser, getTokenByEmailAndPassword, updateUserByIdAndNewValues } = require('../services/user')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError , UnauthenticatedError} = require('../errors')
const { TOKEN_UNAUTHORIZED, PROVIDE_ALL_DATA } = require('../errors/error-msg-list')

// check password and generate token
const login = async (req, res) => {
    const {email, password} = req.body
    if(!email || !password) throw new BadRequestError(PROVIDE_ALL_DATA)

    const token = await getTokenByEmailAndPassword({email:email, password:password})
    if(!token) throw new UnauthenticatedError(TOKEN_UNAUTHORIZED)
    else res.status(StatusCodes.ACCEPTED).json({User:email, Token:token})
}

// create user, encrypt pass and generate token
const registration = async (req, res) => {
    const {first_name, last_name, email, password, role} = req.body
    if(!first_name || !last_name || !email || !password) throw new BadRequestError(PROVIDE_ALL_DATA)

    const user = {first_name, last_name, email, password}
    if(role) user.role = role

    const newUser = await createUser(user)
    res.status(StatusCodes.CREATED).json({User:newUser.email,Token:newUser.token})
}

module.exports = {login, registration}