
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const { 
    createUserInDB, 
    getUserByEmailFromDB,
    deleteUserByIdInDB,
    updateUserByIdInDB
} = require('../repository/user')

const { PASSWORD_INCORRECT,
        TOKEN_UNAUTHORIZED,
        USER_NOT_FOUND,
        NOT_ENOUGH_DATA} = require('../errors/custom-error-msg')

// check password, return token
const getTokenByUser = async (user) => {

    // check if emails user exists
    const userMatched = await getUserByEmailFromDB(user.email)
    if(!userMatched){
        return null
    } else {
        // check password
        const isMatch = await bcrypt.compare(user.password, userMatched.password)
        if ( !isMatch ) {
            throw new Error(PASSWORD_INCORRECT)
        }
        // generate token
        const token = jwt.sign({email: user.email},
                                process.env.JWT_SECRET,
                                {expiresIn:process.env.JWT_LIFETIME})
    
        return ( { email: user.email, token: token } ) // return email and token
    }
}

// check user by token
const getUserByToken = async (token) => {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if(!payload) throw new Error(TOKEN_UNAUTHORIZED)
    
    const userMatched = await getUserByEmailFromDB(payload.email)

    if(!userMatched) throw new Error(USER_NOT_FOUND)
    return userMatched
}

// store user and returns token
const storeUser = async (user) => {
    if(!user.first_name ||
        !user.last_name || 
        !user.email ||
        !user.password) throw new Error(NOT_ENOUGH_DATA)

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
    } else {
        return userMatched // user already created
    }    
}

module.exports = {
    storeUser,
    getTokenByUser,
    getUserByToken,
}