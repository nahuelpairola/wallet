const { DataTypes } = require('sequelize')
const {sequelize} = require('../db/connect')

const Amount = sequelize.define('amounts', {
        quantity:{
            type: DataTypes.NUMBER(19,2).UNSIGNED,
            allowNull:false
        },
        amountType:{
            type:DataTypes.BIGINT,
            allowNull:false,
            references: {
                model: 'types',
                key: 'id'
            }
        },
        created_at:{
            type:DataTypes.DATEONLY,
            allowNull:false
        },
        creator:{
            type:DataTypes.BIGINT,
            allowNull:false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
    }, { timestamps: false }
)

module.exports = { Amount }