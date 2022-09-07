
const {Sequelize} = require('sequelize')

const sequelize = new Sequelize(process.env.PSQL_URI)

const connectDB = async () => {
    try{
        await sequelize.authenticate()
        console.log('Connection has been established successfully.');
    } catch (error) {
        throw new Error('Unable to connect to the database')
    }
}

module.exports = {
    connectDB,
    sequelize
}
