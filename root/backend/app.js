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
const port = 3000 || process.env.PORT

// let date = ',2022/07/28'

// let date_from = date.split(',')[0]
// if(date_from !== '') date_from = new Date(date_from)
// let date_to = new Date(date.split(',')[1])

// if(isNaN(date_from)) console.log('A')
// if(isNaN(date_to)) console.log('B')
// console.log(date, date_from , date_to)

const start = async () => {
    try {
        await connectDB()
        app.listen(port, console.log(`Server running on port ${port}...`))
    } catch (error) {
        console.log(error)
    }
}

start()