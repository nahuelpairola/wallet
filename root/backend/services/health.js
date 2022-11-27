const {isConnectionToDBHealthy} = require('../repository/health')

const isConnectionHealthy = async () => {
    if(isConnectionToDBHealthy()) return true
    else return false
}

module.exports = {
    isConnectionHealthy
}