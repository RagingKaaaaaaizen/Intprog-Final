const db = require('../_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    getEmployeeCount
};

async function getAll() {
    const departments = await db.Department.findAll();
    return await Promise.all(departments.map(async department => {
        const count = await getEmployeeCount(department.id);
        return {
            ...department.get(),
            employeeCount: count
        };
    }));
}

async function getById(id) {
    const department = await getDepartment(id);
    const count = await getEmployeeCount(id);
    return {
        ...department.get(),
        employeeCount: count
    };
}

async function create(params) {
    // validate
    if (await db.Department.findOne({ where: { name: params.name } })) {
        throw 'Department with name "' + params.name + '" already exists';
    }

    // create department
    const department = new db.Department(params);
    await department.save();

    return department;
}

async function update(id, params) {
    const department = await getDepartment(id);

    // validate name if changed
    if (params.name && params.name !== department.name && await db.Department.findOne({ where: { name: params.name } })) {
        throw 'Department with name "' + params.name + '" already exists';
    }

    // copy params to department
    Object.assign(department, params);
    department.updated = Date.now();
    await department.save();

    return department;
}

async function _delete(id) {
    const department = await getDepartment(id);
    
    // check if department has employees
    const count = await getEmployeeCount(id);
    if (count > 0) {
        throw 'Department has ' + count + ' employees assigned to it. Please transfer or remove employees before deleting.';
    }
    
    await department.destroy();
}

async function getEmployeeCount(departmentId) {
    return await db.Employee.count({ where: { departmentId } });
}

// helper functions

async function getDepartment(id) {
    const department = await db.Department.findByPk(id);
    if (!department) throw 'Department not found';
    return department;
} 