
const {Amount} = require('./Amount')
const {Type} = require('./Type')
const {User} = require('./User')
const {ResetPasswordToken} = require('./ResetPasswordToken')

Amount.belongsTo(User, { foreignKey: 'creator' });
User.hasMany(Amount, { foreignKey: 'id' });

Type.belongsTo(User, { foreignKey: 'creator' });
User.hasMany(Type, { foreignKey: 'id' });

Amount.belongsTo(Type, { foreignKey: 'amountType' });
Type.hasMany(Amount, { foreignKey: 'id' });

ResetPasswordToken.belongsTo(User, {foreignKey: 'userId'});
User.hasMany(ResetPasswordToken, {foreignKey: 'id'})

module.exports = {User, Type, Amount, ResetPasswordToken}