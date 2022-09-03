
const {Amount} = require('./Amount')
const {Type} = require('./Type')
const {User} = require('./User')

Amount.belongsTo(User, { foreignKey: 'creator' });
User.hasMany(Amount, { foreignKey: 'id' });

Type.belongsTo(User, { foreignKey: 'creator' });
User.hasMany(Type, { foreignKey: 'id' });

Amount.belongsTo(Type, { foreignKey: 'amountType' });
Type.hasMany(Amount, { foreignKey: 'id' });

module.exports = {User, Type, Amount}