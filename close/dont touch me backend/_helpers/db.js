const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const config = require('../config.json');

module.exports = db = {};

initialize();

async function initialize() {
    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, { 
        dialect: 'mysql',
        host: host,
        port: port,
        // Disable logging
        logging: false
    });

    // init models and add them to the exported db object
    db.Account = require('../accounts/account.model')(sequelize);
    db.Employee = require('../employees/employee.model')(sequelize);
    db.Department = require('../departments/department.model')(sequelize);
    db.Workflow = require('../workflows/workflow.model')(sequelize);
    db.Request = require('../requests/request.model')(sequelize);
    db.RequestItem = require('../requests/request-item.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);

    // define relationships
    // Account - Employee (one-to-one)
    db.Account.hasOne(db.Employee, { foreignKey: 'userId' });
    db.Employee.belongsTo(db.Account, { foreignKey: 'userId' });

    // Department - Employee (one-to-many)
    db.Department.hasMany(db.Employee, { foreignKey: 'departmentId' });
    db.Employee.belongsTo(db.Department, { foreignKey: 'departmentId' });

    // Employee - Workflow (one-to-many)
    db.Employee.hasMany(db.Workflow, { foreignKey: 'employeeId' });
    db.Workflow.belongsTo(db.Employee, { foreignKey: 'employeeId' });

    // Employee - Request (one-to-many)
    db.Employee.hasMany(db.Request, { foreignKey: 'employeeId' });
    db.Request.belongsTo(db.Employee, { foreignKey: 'employeeId' });

    // Request - RequestItem (one-to-many)
    db.Request.hasMany(db.RequestItem, { foreignKey: 'requestId' });
    db.RequestItem.belongsTo(db.Request, { foreignKey: 'requestId' });

    // Account - RefreshToken (one-to-many)
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    // sync all models with database
    await sequelize.sync({ alter: true });
} 