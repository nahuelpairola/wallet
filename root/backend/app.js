require('dotenv').config()
const express = require('express')
const app = express()

app.use(express.json())

// db
const {connectDB} = require('./db/connect')

// routes
const amountRoutes = require('./routes/amount')
const userRoutes = require('./routes/user')
const typeRoutes = require('./routes/type')

const auth = require('./middleware/auth')

app.use('/api/v1/amount', auth, amountRoutes)
app.use('/api/v1/type', auth, typeRoutes)
app.use('/api/v1/user', userRoutes)

// start
const port = process.env.PORT

const start = async () => {
    try {
        await connectDB()
        app.listen(port, console.log(`Server running on port ${port}...`))
    } catch (error) {
        console.log(error)
    }
}

start()