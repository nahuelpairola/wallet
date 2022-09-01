const { DataTypes } = require('sequelize')
const {sequelize} = require('../db/connect')

const Amount = sequelize.define('amounts', {
        id:{
            primaryKey:true,
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        quantity:{
            type: DataTypes.NUMBER(19,2).UNSIGNED,
            allowNull:false
        },
        type:{
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
        }
    }, { timestamps: false }
)

module.exports = { Amount }