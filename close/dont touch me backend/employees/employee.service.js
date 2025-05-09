const db = require('../_helpers/db');
const workflowService = require('../workflows/workflow.service');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    transfer
};

async function getAll() {
    const employees = await db.Employee.findAll({
        include: [
            { model: db.Account, attributes: ['firstName', 'lastName', 'email'] },
            { model: db.Department, attributes: ['name'] }
        ]
    });
    return employees.map(x => basicDetails(x));
}

async function getById(id) {
    const employee = await getEmployee(id);
    return basicDetails(employee);
}

async function create(params) {
    // validate unique employeeId
    if (await db.Employee.findOne({ where: { employeeId: params.employeeId } })) {
        throw 'Employee ID "' + params.employeeId + '" is already taken';
    }

    // create employee
    const employee = new db.Employee(params);
    await employee.save();

    // create onboarding workflow if service exists
    if (typeof workflowService.createOnboarding === 'function') {
        await workflowService.createOnboarding(employee.id);
    }

    return basicDetails(employee);
}

async function update(id, params) {
    const employee = await getEmployee(id);

    // validate employeeId if changed
    if (params.employeeId && params.employeeId !== employee.employeeId && 
        await db.Employee.findOne({ where: { employeeId: params.employeeId } })) {
        throw 'Employee ID "' + params.employeeId + '" is already taken';
    }

    // copy params to employee
    Object.assign(employee, params);
    employee.updated = Date.now();
    await employee.save();

    return basicDetails(employee);
}

async function _delete(id) {
    const employee = await getEmployee(id);
    
    // check if employee has associated workflows/requests before deleting
    const workflowCount = await db.Workflow.count({ where: { employeeId: id } });
    const requestCount = await db.Request.count({ where: { employeeId: id } });
    
    if (workflowCount > 0 || requestCount > 0) {
        throw 'Employee has associated workflows or requests. Please delete those first.';
    }

    await employee.destroy();
}

async function transfer(id, params) {
    const employee = await getEmployee(id);
    const departmentId = params.departmentId;
    
    // validate department exists
    const department = await db.Department.findByPk(departmentId);
    if (!department) {
        throw 'Department not found';
    }
    
    // transfer employee
    const oldDepartmentId = employee.departmentId;
    employee.departmentId = departmentId;
    employee.updated = Date.now();
    await employee.save();
    
    // create transfer workflow if service exists
    if (typeof workflowService.createTransfer === 'function') {
        await workflowService.createTransfer(employee.id, oldDepartmentId, departmentId);
    }
    
    return basicDetails(employee);
}

// helper functions

async function getEmployee(id) {
    const employee = await db.Employee.findByPk(id, {
        include: [
            { model: db.Account, attributes: ['firstName', 'lastName', 'email'] },
            { model: db.Department, attributes: ['name'] }
        ]
    });
    if (!employee) throw 'Employee not found';
    return employee;
}

function basicDetails(employee) {
    const { id, employeeId, position, departmentId, userId, hireDate, status, created, updated } = employee;
    const accountDetails = employee.account ? {
        firstName: employee.account.firstName,
        lastName: employee.account.lastName,
        email: employee.account.email
    } : null;
    const departmentName = employee.department ? employee.department.name : null;
    
    return { 
        id, 
        employeeId, 
        position, 
        departmentId,
        departmentName, 
        userId, 
        account: accountDetails,
        hireDate, 
        status, 
        created, 
        updated 
    };
} 