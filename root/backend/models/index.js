const {Amount} = require('./Amount')
const {Type} = require('./Type')
const {User} = require('./User')

User.hasMany(Type)
User.hasMany(Amount)

Type.belongsTo(User)
Amount.belongsTo(User,Type)

module.exports = {User, Type, Amount}