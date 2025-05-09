const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        type: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        status: { 
            type: DataTypes.STRING, 
            allowNull: false,
            defaultValue: 'Pending' 
        },
        details: { 
            type: DataTypes.JSON, 
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

    return sequelize.define('workflow', attributes);
} 