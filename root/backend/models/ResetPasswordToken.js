const { DataTypes } = require('sequelize')
const {sequelize} = require('../db/connect')

const ResetPasswordToken = sequelize.define('resetPasswordTokens', {
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING(40),
        allowNull: false,

    },
    token:{
        type:DataTypes.STRING(350),
        allowNull:false
    },
    created_at:{
        type:DataTypes.DATEONLY,
        allowNull: false,
        default: new Date()
    },
    expired_at:{
        type:DataTypes.DATEONLY,
        allowNull: false,
        default: new Date(new Date().getTime() + 60 * 60 * 24 * 1000)
    },
}, { timestamps: false }
)

module.exports = { ResetPasswordToken }