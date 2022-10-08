const Joi = require("joi")
require('dotenv').config()

const express = require('express')
require('express-async-errors')

const app = express()

app.use(express.json())

// db
const {connectDB} = require('./db/connect')

//middleware
const authenticationMiddleware = require('./middleware/authentication')
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

// validators
const validator = require('express-joi-validation').createValidator({})

const User = Joi.object({
  first_name: Joi.string().min(3).max(15).required(),    
  last_name: Joi.string().min(3).max(15).required(),
  email: Joi.string().email().trim().lowercase(),
  password: Joi.string().trim(),
  role: Joi.string().required(false).valid('user','admin').default('user')
}).with('first_name','last_name','email','password')
  
const UserId = Joi.object({
  id: Joi.number().positive().min(0).required()
})

// routes
const amountRoutes = require('./routes/amount')
const authRoutes = require('./routes/auth')
const typeRoutes = require('./routes/type')
const userRoutes = require('./routes/user')

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', authenticationMiddleware, validator.params(UserId), validator.body(User), userRoutes)
app.use('/api/v1/type', authenticationMiddleware, typeRoutes)
app.use('/api/v1/amount', authenticationMiddleware, amountRoutes)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

// start
const port = process.env.PORT 

const start = async () => {
    try {
        await connectDB()
        app.listen(port, console.log(`Server running on port ${port}...`))
    } catch (error) {
        console.log('Connection error: ', error)
    }
}

start()