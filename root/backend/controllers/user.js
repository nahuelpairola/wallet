
const { createUser, getTokenByUser } = require('../services/user')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError , UnauthenticatedError} = require('../errors')
const { TOKEN_UNAUTHORIZED, USER_ALREADY_CREATED, PROVIDE_ALL_DATA } = require('../errors/error-msg-list')


// check password and generate token
const login = async (req, res, next) => {
    const {email, password} = req.body
    if(!email || !password) {
        throw new BadRequestError('Please provide email and password')
    }
    const userToCheck = {email:email, password:password}
    const userAndToken = await getTokenByUser(userToCheck)
    if(!userAndToken){
        throw new UnauthenticatedError(TOKEN_UNAUTHORIZED)
    } else {
        res.status(StatusCodes.ACCEPTED).json({user:userAndToken.email, token:userAndToken.token})
    }
}

// create user, encrypt pass and generate token
const registration = async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        password,
        role
    } = req.body

    if(!first_name || !last_name || !email || !password) {
        throw new BadRequestError(PROVIDE_ALL_DATA)
    }

    const user = {first_name, last_name, email, password}
    if(role) user.role = role

    const newUser = await createUser(user)
    res.status(StatusCodes.CREATED).json({newUser})
}

module.exports = {login, registration}