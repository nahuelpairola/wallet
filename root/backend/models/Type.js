const { DataTypes } = require('sequelize')
const {sequelize} = require('../db/connect')

const Type = sequelize.define('types', {
        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        movement:{
            type: DataTypes.ENUM('input','output'),
            allNull:false
        },
        name:{
            type: DataTypes.STRING(30),
            allowNull:false
        },
        created_at:{
            type:DataTypes.DATEONLY,
            allowNull:false
        },
        creator:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        default:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
            default: false
        }
    }, { timestamps: false }
)

module.exports = { Type }