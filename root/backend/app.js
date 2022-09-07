require('express-async-errors')
require('dotenv').config()

const express = require('express')
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
const userRoutes = require('./routes/user')
const typeRoutes = require('./routes/type')

app.use('/api/v1/amount', authenticationMiddleware, amountRoutes)
app.use('/api/v1/type', authenticationMiddleware, typeRoutes)
app.use('/api/v1/user', userRoutes)

app.use(errorHandlerMiddleware)
app.use(notFoundMiddleware)

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