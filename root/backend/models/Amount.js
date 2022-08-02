const { DataTypes } = require('sequelize')
const {sequelize} = require('../db/connect')

const Amount = sequelize.define('amounts', {
        quantity:{
            type: DataTypes.NUMBER(19,2).UNSIGNED,
            allowNull:false
        },
        type:{
            type:DataTypes.BIGINT,
            allowNull:false
        },
        created_at:{
            type:DataTypes.DATEONLY,
            allowNull:false
        },
        creator:{
            type:DataTypes.BIGINT,
            allowNull:false
        }
    }, { timestamps: false }
)

module.exports = { Amount }