const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: {
            type: DataTypes.DATE,
            allowNull: true,
            onUpdate: DataTypes.NOW
        }
    };

    return sequelize.define('department', attributes);
} 