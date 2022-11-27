const {sequelize} = require('../db/connect')

const isConnectionToDBHealthy = async () => {
    const result = await sequelize.query('SELECT 1+1 AS result')
    if(result[0][0].result===2) return true
    else return false
} 

module.exports = {
    isConnectionToDBHealthy
}