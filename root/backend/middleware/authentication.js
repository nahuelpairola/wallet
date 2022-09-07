// middleware for auth
// check user token
const {getUserByToken} = require('../services/user')
const {UnauthenticatedError} = require('../errors/unauthenticated')
const { USER_NOT_FOUND } = require('../errors/custom-error-msg')

const authentication = async (req,res,next) => {
    const auth = req.headers.authorization // (req.req || req).
    if(!auth || !auth.startsWith('Bearer ')) {
        throw new UnauthenticatedError('Unauthorized access')
    }
    token = auth.split(' ')[1]
    const user = await getUserByToken(token)
    if(!user) throw new UnauthenticatedError('Unauthorized access')
    req.user = {id:user.id,email:user.email,role:user.role}// create user inside req object
    next()
}

module.exports = authentication