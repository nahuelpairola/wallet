const { DataTypes } = require('sequelize')
const {sequelize} = require('../db/connect')

const Type = sequelize.define('types', {
        id:{
            primaryKey:true,
            type: DataTypes.BIGINT,
            allowNull: false,
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
            type: DataTypes.BIGINT,
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