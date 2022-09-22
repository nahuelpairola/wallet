
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const { 
    createUserInDB, 
    getUserByEmailFromDB,
    deleteUserByIdInDB,
    updateUserByIdInDB
} = require('../repository/user')

const { PASSWORD_INCORRECT,
        USER_NOT_FOUND,
        NOT_ENOUGH_DATA,
        PROVIDE_ALL_DATA,
        USER_ALREADY_CREATED} = require('../errors/error-msg-list')

const { ServiceError, NotFoundError, UnauthenticatedError, BadRequestError } = require('../errors')

// check password, return token
const getTokenByEmailAndPassword = async (emailAndPassword) => {
    // check if emails user exists
    const userMatched = await getUserByEmailFromDB(emailAndPassword.email)
    if(!userMatched) throw new NotFoundError(USER_NOT_FOUND)
    else {
        // check password
        const isMatch = await bcrypt.compare(emailAndPassword.password, userMatched.password)
        if ( !isMatch ) throw new UnauthenticatedError(PASSWORD_INCORRECT)
        // generate token
        const token = jwt.sign({email: userMatched.email},
                                process.env.JWT_SECRET,
                                {expiresIn:process.env.JWT_LIFETIME})
        return token // return token
    }
}

// check user by token
const getUserByToken = async (token) => {
    const payload = jwt.verify(token, process.env.JWT_SECRET)    
    const userMatched = await getUserByEmailFromDB(payload.email)
    if(!userMatched) throw new NotFoundError(USER_NOT_FOUND)
    return userMatched
}

// store user and returns token
const createUser = async (user) => {
    if(!user.first_name ||
        !user.last_name || 
        !user.email ||
        !user.password) throw new ServiceError(NOT_ENOUGH_DATA)

    // check if emails user exists
    const userMatched = await getUserByEmailFromDB(user.email)

    if(!userMatched || userMatched.email !== user.email) {
        // add time when it was created
        user.created_at = new Date()

        // generate crypted password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)

        const userCreated = await createUserInDB({ // store in db
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            password: user.password,
            created_at: user.created_at,
            role: user.role
        })    
        
        // create token, payload = email
        const token = jwt.sign({email: userCreated.email},
                                process.env.JWT_SECRET,
                                {expiresIn:process.env.JWT_LIFETIME})

        return ( { email: user.email, token: token } )
    } else throw new BadRequestError(USER_ALREADY_CREATED)
}

const isUserAnAdmin = (user) => {

    if(!user.role) throw new ServiceError(PROVIDE_ALL_DATA)
    if(user.role === 'admin') return true
    else return false
}

module.exports = {
    createUser,
    getTokenByEmailAndPassword,
    getUserByToken,
    isUserAnAdmin,
}