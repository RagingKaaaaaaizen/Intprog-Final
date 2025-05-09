const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        employeeId: { 
            type: DataTypes.STRING, 
            allowNull: false,
            unique: true 
        },
        position: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        hireDate: { 
            type: DataTypes.DATE, 
            allowNull: false,
            defaultValue: DataTypes.NOW 
        },
        status: { 
            type: DataTypes.STRING, 
            allowNull: false,
            defaultValue: 'Active' 
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

    return sequelize.define('employee', attributes);
} 