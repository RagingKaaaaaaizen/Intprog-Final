const db = require('../_helpers/db');

module.exports = {
    getAll,
    getById,
    getByEmployeeId,
    create,
    update,
    delete: _delete,
    getItemsByRequestId
};

async function getAll() {
    const requests = await db.Request.findAll({
        include: [
            { model: db.Employee, include: [db.Account] },
            { model: db.RequestItem }
        ]
    });
    return await Promise.all(requests.map(async x => {
        const items = await getItemsByRequestId(x.id);
        return {
            ...basicDetails(x),
            items
        };
    }));
}

async function getById(id) {
    const request = await getRequest(id);
    const items = await getItemsByRequestId(id);
    return {
        ...basicDetails(request),
        items
    };
}

async function getByEmployeeId(employeeId) {
    const requests = await db.Request.findAll({
        where: { employeeId },
        include: [
            { model: db.Employee, include: [db.Account] },
            { model: db.RequestItem }
        ]
    });
    return await Promise.all(requests.map(async x => {
        const items = await getItemsByRequestId(x.id);
        return {
            ...basicDetails(x),
            items
        };
    }));
}

async function create(params) {
    // validate employee exists
    const employee = await db.Employee.findByPk(params.employeeId);
    if (!employee) {
        throw 'Employee not found';
    }

    // create request
    const request = new db.Request({
        employeeId: params.employeeId,
        type: params.type,
        status: params.status || 'Pending',
        notes: params.notes
    });
    await request.save();

    // create request items
    if (params.items && params.items.length) {
        for (const item of params.items) {
            await db.RequestItem.create({
                requestId: request.id,
                name: item.name,
                quantity: item.quantity || 1,
                notes: item.notes
            });
        }
    }

    // return request with items
    return await getById(request.id);
}

async function update(id, params) {
    const request = await getRequest(id);
    
    // update request fields
    if (params.type) request.type = params.type;
    if (params.status) request.status = params.status;
    if (params.notes !== undefined) request.notes = params.notes;
    
    request.updated = Date.now();
    await request.save();
    
    // update items if provided
    if (params.items && params.items.length) {
        // delete existing items
        await db.RequestItem.destroy({ where: { requestId: id } });
        
        // create new items
        for (const item of params.items) {
            await db.RequestItem.create({
                requestId: id,
                name: item.name,
                quantity: item.quantity || 1,
                status: item.status || 'Pending',
                notes: item.notes
            });
        }
    }
    
    // return updated request with items
    return await getById(id);
}

async function _delete(id) {
    const request = await getRequest(id);
    
    // delete related items first
    await db.RequestItem.destroy({ where: { requestId: id } });
    
    // delete request
    await request.destroy();
}

async function getItemsByRequestId(requestId) {
    return await db.RequestItem.findAll({
        where: { requestId },
        order: [['created', 'ASC']]
    });
}

// helper functions

async function getRequest(id) {
    const request = await db.Request.findByPk(id, {
        include: [{ model: db.Employee, include: [db.Account] }]
    });
    if (!request) throw 'Request not found';
    return request;
}

function basicDetails(request) {
    const { id, employeeId, type, status, notes, created, updated } = request;
    
    // get employee details if available
    let employeeDetails = null;
    if (request.employee) {
        employeeDetails = {
            id: request.employee.id,
            employeeId: request.employee.employeeId,
            fullName: request.employee.account ? 
                request.employee.account.firstName + ' ' + request.employee.account.lastName : 'Unknown'
        };
    }
    
    return { 
        id, 
        employeeId, 
        employee: employeeDetails, 
        type, 
        status, 
        notes, 
        created, 
        updated 
    };
} 