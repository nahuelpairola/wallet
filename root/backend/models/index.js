
const {Amount} = require('./Amount')
const {Type} = require('./Type')
const {User} = require('./User')


User.hasMany(Type,{foreignKey: 'id'})
Type.belongsTo(User, {foreignKey: 'creator'})

User.hasMany(Amount,{foreignKey: 'id'})
Amount.belongsTo(User, {foreignKey: 'creator'})

Type.hasMany(Amount,{foreignKey: 'id'})

module.exports = {User, Type, Amount}