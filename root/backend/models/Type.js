const { DataTypes } = require('sequelize')
const {sequelize} = require('../db/connect')

const Type = sequelize.define('types', {
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

const isMovement = (movementToCompare) => {
    const isMatch = Type.rawAttributes.movement.values.find((movement) => {
        movement === movementToCompare
    })
    if(isMatch) return true
    else false
}

module.exports = { Type , isMovement}