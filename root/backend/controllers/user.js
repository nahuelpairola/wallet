
const { storeUser, getTokenByUser } = require('../services/user')

// check password and generate token
const login = async (req, res) => {
    const {email, password} = req.body
    if(!email || !password) {
        res.status(400).send('Please provide email and password')
    }
    const userToCheck = {email:email, password:password}
    const userAndToken = await getTokenByUser(userToCheck)

    if(!userAndToken){
        res.status(401).send('Unauthorized access')
    }
    
    res.status(200).send(userAndToken)
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
        res.status(400).send('Please provide all data')
    }

    const user = {first_name, last_name, email, password}
    
    if(role) {
        user.role = role
    }

    const result = await storeUser(user)
    
    if(!result) {
        res.status(400).send('User already created')
    } else {
        res.status(201).send(result)
    }
}

module.exports = {login, registration}