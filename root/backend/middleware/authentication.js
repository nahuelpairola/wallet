// middleware for auth
// check user token
const {getUserByToken} = require('../services/user')
const UnauthenticatedError = require('../errors/unauthenticated')
const { ACCESS_UNAUTHORIZED } = require('../errors/error-msg-list')

const authentication = async (req,res,next) => {
    const auth = req.headers.authorization // (req.req || req).
    if(!auth || !auth.startsWith('Bearer ')) throw new UnauthenticatedError(ACCESS_UNAUTHORIZED)
    token = auth.split(' ')[1]
    const user = await getUserByToken(token)
    if(!user) throw new UnauthenticatedError(ACCESS_UNAUTHORIZED)
    req.user = {id:Number(user.id),email:user.email,role:user.role}// create user inside req object
    next()
}

module.exports = authentication