const db = require('../_helpers/db');

module.exports = {
    getAll,
    getById,
    getByEmployeeId,
    create,
    updateStatus,
    createOnboarding,
    createTransfer
};

async function getAll() {
    const workflows = await db.Workflow.findAll({
        include: [{ model: db.Employee, include: [db.Account] }]
    });
    return workflows.map(x => basicDetails(x));
}

async function getById(id) {
    const workflow = await getWorkflow(id);
    return basicDetails(workflow);
}

async function getByEmployeeId(employeeId) {
    const workflows = await db.Workflow.findAll({
        where: { employeeId },
        include: [{ model: db.Employee, include: [db.Account] }]
    });
    return workflows.map(x => basicDetails(x));
}

async function create(params) {
    // validate employee exists
    const employee = await db.Employee.findByPk(params.employeeId);
    if (!employee) {
        throw 'Employee not found';
    }

    // create workflow
    const workflow = new db.Workflow({
        employeeId: params.employeeId,
        type: params.type,
        details: params.details || {},
        status: params.status || 'Pending'
    });
    await workflow.save();

    return basicDetails(workflow);
}

async function updateStatus(id, { status }) {
    const workflow = await getWorkflow(id);
    
    // update status
    workflow.status = status;
    workflow.updated = Date.now();
    await workflow.save();
    
    return basicDetails(workflow);
}

async function createOnboarding(employeeId) {
    return await create({
        employeeId,
        type: 'Onboarding',
        details: { 
            tasks: [
                { name: 'Setup workstation', completed: false },
                { name: 'Provide access cards', completed: false },
                { name: 'System access', completed: false },
                { name: 'Orientation', completed: false }
            ]
        }
    });
}

async function createTransfer(employeeId, oldDepartmentId, newDepartmentId) {
    // get department names
    const oldDept = await db.Department.findByPk(oldDepartmentId);
    const newDept = await db.Department.findByPk(newDepartmentId);
    
    return await create({
        employeeId,
        type: 'Department Transfer',
        details: {
            oldDepartmentId,
            oldDepartmentName: oldDept ? oldDept.name : 'Unknown',
            newDepartmentId,
            newDepartmentName: newDept ? newDept.name : 'Unknown',
            tasks: [
                { name: 'Update access permissions', completed: false },
                { name: 'Transfer files and documents', completed: false },
                { name: 'Update reporting structure', completed: false }
            ]
        }
    });
}

// helper functions

async function getWorkflow(id) {
    const workflow = await db.Workflow.findByPk(id, {
        include: [{ model: db.Employee, include: [db.Account] }]
    });
    if (!workflow) throw 'Workflow not found';
    return workflow;
}

function basicDetails(workflow) {
    const { id, employeeId, type, status, details, created, updated } = workflow;
    
    // get employee details if available
    let employeeDetails = null;
    if (workflow.employee) {
        employeeDetails = {
            id: workflow.employee.id,
            employeeId: workflow.employee.employeeId,
            position: workflow.employee.position,
            fullName: workflow.employee.account ? 
                workflow.employee.account.firstName + ' ' + workflow.employee.account.lastName : 'Unknown'
        };
    }
    
    return { 
        id, 
        employeeId, 
        employee: employeeDetails, 
        type, 
        status, 
        details, 
        created, 
        updated 
    };
} 