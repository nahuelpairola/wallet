
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const { 
    createUserInDB, 
    getUserByEmailFromDB,
    deleteUserByIdInDB,
    updateUserByIdFirstNameLastNameEmailAndPasswordInDB,
} = require('../repository/user')

const {
    deleteAllAmountsOfCreatorByCreatorId
} = require('./amount')

const { 
    deleteAllCustomTypesOfCreatorByCreatorId
} = require('./type')

const {
    isUserAnAdmin
} = require('../services/usersTypesAndAmounts')

const { PASSWORD_INCORRECT,
        USER_NOT_FOUND,
        NOT_ENOUGH_DATA,
        USER_ALREADY_CREATED,
        USER_UPDATING_ERROR,
        USER_UPDATING_UNAUTHORIZED,
        USER_DELETING_UNAUTHORIZED,
        } = require('../errors/error-msg-list')

const {
    UserSearchError, 
    UserNotFoundError, 
    UserCreateError, 
    UserUpdateError, 
    UserDeleteError 
} = require('../errors/user-errors')

const generatePassword = async (password) => {
    const salt = await bcrypt.genSalt(10) // generate crypted password
    passwordSaltedAndHashed = await bcrypt.hash(password, salt)
    return passwordSaltedAndHashed
}

const generateTokenByEmail = (userEmail) => {
    const token = jwt.sign({email: userEmail},
                                process.env.JWT_SECRET,
                                {expiresIn:process.env.JWT_LIFETIME})
    return token
}

// check password, return token
const getTokenByEmailAndPassword = async (emailAndPassword) => {
    // check if emails user exists
    if(!emailAndPassword) throw new UserSearchError(NOT_ENOUGH_DATAS)
    const userMatched = await getUserByEmailFromDB(emailAndPassword.email)
    if(!userMatched) throw new UserNotFoundError(USER_NOT_FOUND)
    else {
        // check password
        const isMatch = await bcrypt.compare(emailAndPassword.password, userMatched.password)
        if ( !isMatch ) throw new UserSearchError(PASSWORD_INCORRECT)
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
    if(!userMatched) return null
    else return userMatched
}

// store user and returns token
const createUser = async (user) => {
    if(!user.first_name ||
        !user.last_name || 
        !user.email ||
        !user.password) throw new UserCreateError(NOT_ENOUGH_DATA)

    // check if emails user exists
    const userMatched = await getUserByEmailFromDB(user.email)

    if(!userMatched) {
        user.created_at = new Date() // add time when it was created
        user.password = await generatePassword(user.password)
        const userCreated = await createUserInDB({ // store in db
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            password: user.password,
            created_at: user.created_at,
            role: user.role
        })
        // create token, payload = email
        const token = generateTokenByEmail(userCreated.email)

        return ( { email: user.email, token: token } )
    } else throw new UserCreateError(USER_ALREADY_CREATED)
}

const updateUserByIdUserAndNewValuesGetEmailAndNewToken = async ({id: userId, user , newValues}) => {
    if( !userId ||
        !user.id ||
        !user.email ||
        !newValues.first_name || 
        !newValues.last_name || 
        !newValues.email || 
        !newValues.password ) throw new UserUpdateError(NOT_ENOUGH_DATA)

    if(userId !== user.id) throw new UserUpdateError(USER_UPDATING_UNAUTHORIZED) // check user acces vs user id to update
    
    const isAnyUserWithNewEmail = await getUserByEmailFromDB(newValues.email) //check if the email is available
    if(isAnyUserWithNewEmail && isAnyUserWithNewEmail.id !== userId) throw new UserUpdateError(USER_EMAIL_NOT_AVAILABLE)

    newValues.password = await generatePassword(newValues.password) // cript new passwrod

    const updatedUser = await updateUserByIdFirstNameLastNameEmailAndPasswordInDB({
        id: userId,
        first_name: newValues.first_name,
        last_name: newValues.last_name,
        email: newValues.email,
        password: newValues.password
    })
    
    if(!updatedUser) throw new UserUpdateError(USER_UPDATING_ERROR)
    else {
        const token = generateTokenByEmail(updatedUser.email)
        return {email:updatedUser.email,token:token}
    }
}

const deleteUserByIdAndUser = async ({id: userId, user:{id,email}}) => {
    if(!userId || !id || !email) throw new UserDeleteError(NOT_ENOUGH_DATA)
    if(userId !== id) throw new UserDeleteError(USER_DELETING_UNAUTHORIZED)
    const userMatched = await getUserByEmailFromDB(email)
    if(!userMatched) throw new UserDeleteError(USER_NOT_FOUND)
    if(Number(userMatched.id) !== userId) throw new UserDeleteError(USER_DELETING_UNAUTHORIZED)
    // check user role
    if(isUserAnAdmin(userMatched)) { 
        // user is an admin, just delete user
        const userDeleted = await deleteUserByIdInDB(userId)
        return userDeleted
    } else {
        // user is a normal one:
        // 1. delete amounts
        // 2. delete custom types
        // 3. delete user
        const amountsDeleted = await deleteAllAmountsOfCreatorByCreatorId(userId)
        const customTypesDeleted = await deleteAllCustomTypesOfCreatorByCreatorId(userId)
        const userDeleted = await deleteUserByIdInDB(userId)
        return {user:userDeleted,nTypes:customTypesDeleted.length,nAmounts:amountsDeleted.length}
    }
}

module.exports = {
    createUser,
    getTokenByEmailAndPassword,
    getUserByToken,
    updateUserByIdUserAndNewValuesGetEmailAndNewToken,
    deleteUserByIdAndUser,
}