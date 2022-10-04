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

// routes
const amountRoutes = require('./routes/amount')
const authRoutes = require('./routes/auth')
const typeRoutes = require('./routes/type')
const userRoutes = require('./routes/user')

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/amount', authenticationMiddleware, amountRoutes)
app.use('/api/v1/type', authenticationMiddleware, typeRoutes)
app.use('/api/v1/user', authenticationMiddleware, userRoutes)

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