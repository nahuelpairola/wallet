// middleware for auth
// check user token
const {getUserByToken} = require('../services/user')

const auth = async (req,res,next) => {
    const auth = req.headers.authorization // (req.req || req).
    if(!auth || !auth.startsWith('Bearer ')) {
        res.status(401).send('Unauthorized access')
    }
    token = auth.split(' ')[1]
    try {
        const user = await getUserByToken(token)
        req.user = user// create user inside req object
        next()
    } catch (error) {
        res.status(401).send('Unauthorized access')
    }
}

module.exports = auth