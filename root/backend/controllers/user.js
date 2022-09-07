
const { storeUser, getTokenByUser } = require('../services/user')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError , UnauthenticatedError} = require('../errors')

// check password and generate token
const login = async (req, res, next) => {
    const {email, password} = req.body
    if(!email || !password) {
        throw new BadRequestError('Please provide email and password')
    }
    const userToCheck = {email:email, password:password}
    const userAndToken = await getTokenByUser(userToCheck)
    if(!userAndToken){
        throw new UnauthenticatedError('Unauthorized access')
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
        throw new BadRequestError('Please provide first_name, last_name, email and password')
    }

    const user = {first_name, last_name, email, password}
    
    if(role) {
        user.role = role
    }

    const newUser = await storeUser(user)
    
    if(!newUser) {
        res.status(StatusCodes.CONFLICT).json({msg:'User already created'})
    } else {
        res.status(StatusCodes.CREATED).json({newUser})
    }
}

module.exports = {login, registration}