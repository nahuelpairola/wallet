
const {Amount} = require('./Amount')
const {Type} = require('./Type')
const {User} = require('./User')


User.hasMany(Type,{foreignKey: {name: 'creator'}})
Type.belongsTo(User, {foreignKey: {name:'id'}})

User.hasMany(Amount,{foreignKey: {name: 'creator'}})
Amount.belongsTo(User, {foreignKey: {name:'id'}})

Type.hasMany(Amount,{foreignKey: {name:'type'}})

module.exports = {User, Type, Amount}