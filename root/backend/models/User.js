const { DataTypes } = require('sequelize')
const { sequelize } = require('../db/connect')

const User = sequelize.define('users', {
        first_name:{
            type: DataTypes.STRING(15),
            allowNull:false
        },
        last_name:{
            type:DataTypes.STRING(15),
            allowNull:false
        },
        email:{
            type:DataTypes.STRING(40),
            allowNull:false
        },
        password:{
            type:DataTypes.STRING(60),
            allowNull:false
        },
        created_at:{
            type:DataTypes.DATEONLY,
            allowNull:false
        },
        role:{
            type: DataTypes.ENUM('user','admin'),
            allowNull:false,
            defaultValue:'user'
        }
    }, { timestamps: false }
)

module.exports = { User }