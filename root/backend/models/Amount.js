const { DataTypes } = require('sequelize')
const {sequelize} = require('../db/connect')

const Amount = sequelize.define('amounts', {
        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        quantity:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        amountType:{
            type:DataTypes.INTEGER,
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
            type:DataTypes.INTEGER,
            allowNull:false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
    }, { timestamps: false }
)

module.exports = { Amount }