require('dotenv').config()
const express = require('express')
const app = express()

// security packs
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

require('express-async-errors')

// db
const {connectDB} = require('./db/connect')

//middleware
const authenticationMiddleware = require('./middleware/authentication')
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

// routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const typeRoutes = require('./routes/type')
const amountRoutes = require('./routes/amount')
const healthRoute = require('./routes/health')
const { RESET_CONTENT, StatusCodes } = require('http-status-codes')

app.set('trust proxy', 1)
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
}))
app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(xss())
app.disable('x-powered-by')

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', authenticationMiddleware, userRoutes)
app.use('/api/v1/type', authenticationMiddleware, typeRoutes)
app.use('/api/v1/amount', authenticationMiddleware, amountRoutes)
app.use('/api/v1/health', healthRoute)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

// start
const port = process.env.PORT || 4000

const start = async () => {
    try {
        await connectDB()
        app.listen(port, console.log(`Server running on port ${port}...`))
    } catch (error) {
        console.log('Connection error: ', error)
    }
}

start()