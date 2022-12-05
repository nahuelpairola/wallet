
const { createUserReturnUserAndToken, getTokenAndUserByEmailAndPassword } = require('../services/user')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError , UnauthenticatedError} = require('../errors')
const { TOKEN_UNAUTHORIZED, PROVIDE_ALL_DATA } = require('../errors/error-msg-list')

const login = async (req, res) => {
    const {email, password} = req.body
    if(!email || !password) throw new BadRequestError(PROVIDE_ALL_DATA)
    const {user,token} = await getTokenAndUserByEmailAndPassword({email:email, password:password})
    if(!token) throw new UnauthenticatedError(TOKEN_UNAUTHORIZED)
    else res.status(StatusCodes.ACCEPTED).json({
        user: {id:user.id,email:email},
        token: token, 
        msg: "LOGIN SUCCESSFUL"})
}

const registration = async (req, res) => {
    const {first_name, last_name, email, password, role} = req.body
    if(!first_name || !last_name || !email || !password) throw new BadRequestError(PROVIDE_ALL_DATA)
    const user = {first_name, last_name, email, password}
    if(role) user.role = role
    const {user:userCreated,token:token} = await createUserReturnUserAndToken(user)
    res.status(StatusCodes.CREATED).json({
        user:{id:userCreated.id,email:userCreated.email},
        token:token, 
        msg: "REGISTRATION SUCCESSFUL"})
}

module.exports = {login, registration}