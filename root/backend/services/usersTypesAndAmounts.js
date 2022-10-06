
const {getAtLeastOneAmountUsingThisTypeIdInDB} = require('../repository/amount')

const isUserAnAdmin = (user) => {
    if(!user.role) throw new UserSearchError(PROVIDE_ALL_DATA)
    if(user.role === 'admin') return true
    else return false
}

const isAnAmountUsingThisTypeId = async (typeId) => {
    if(!typeId) throw new ServiceError(NOT_ENOUGH_DATA)
    const amount = await getAtLeastOneAmountUsingThisTypeIdInDB(typeId)
    if(amount) return true
    else return false
}

module.exports = {
    isAnAmountUsingThisTypeId,
    isUserAnAdmin,
}
