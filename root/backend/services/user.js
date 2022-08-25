
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const { 
    createUser, 
    getUserByEmail,
    deleteUserById,
    updateUserById
} = require('../repository/user')

// check password, return token
const getTokenByUser = async (user) => {

    // check if emails user exists
    const userMatched = await getUserByEmail(user.email)

    if(userMatched && userMatched.email === user.email) {

        // check password
        const isMatch = await bcrypt.compare(user.password, userMatched.password)
        if ( !isMatch ) {
            return // CHECK ERROR RESPONSE
        }

        // generate token
        const token = jwt.sign({email: user.email},
                                process.env.JWT_SECRET,
                                {expiresIn:process.env.JWT_LIFETIME})

        return ( { email: user.email, token: token } ) // return email and token
    } else {
        return // CHECK ERROR RESPONSE
    }
}

// check user by token
const getUserByToken = async (token) => {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const userMatched = await getUserByEmail(payload.email)
    return userMatched
}

// store user and returns token
const storeUser = async (user) => {

    // check if emails user exists
    const userMatched = await getUserByEmail(user.email)

    if(!userMatched || userMatched.email !== user.email) {
        // add time when it was created
        user.created_at = new Date()

        // generate crypted password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)

        const userCreated = await createUser({ // store in db
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
        return
    }    
}

module.exports = {
    storeUser,
    getTokenByUser,
    getUserByToken,
}