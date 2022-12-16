// middleware for auth
// check user token
const {getByToken} = require('../services/user')
const UnauthenticatedError = require('../errors/unauthenticated')
const { ACCESS_UNAUTHORIZED } = require('../errors/error-msg-list')

const authentication = async (req,res,next) => {
    const auth = req.headers.authorization // (req.req || req).
    if(!auth || !auth.startsWith('Bearer ')) throw new UnauthenticatedError(ACCESS_UNAUTHORIZED)
    token = auth.split(' ')[1]
    const user = await getByToken(token)
    if(!user) throw new UnauthenticatedError(ACCESS_UNAUTHORIZED)
    req.user = {id:user.id,email:user.email,role:user.role,accountBalance:user.accountBalance} // create user inside req object
    next()
}

module.exports = authentication