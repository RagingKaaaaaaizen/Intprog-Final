const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        name: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        quantity: { 
            type: DataTypes.INTEGER, 
            allowNull: false,
            defaultValue: 1
        },
        status: { 
            type: DataTypes.STRING, 
            allowNull: false,
            defaultValue: 'Pending' 
        },
        notes: { 
            type: DataTypes.TEXT, 
            allowNull: true 
        },
        created: { 
            type: DataTypes.DATE, 
            allowNull: false, 
            defaultValue: DataTypes.NOW 
        },
        updated: {
            type: DataTypes.DATE,
            allowNull: true,
            onUpdate: DataTypes.NOW
        }
    };

    return sequelize.define('requestItem', attributes);
} 