const express = require('express');
const router = express.Router();
const requestService = require('./request.service');
const validation = require('./request.validation');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

// routes
router.get('/', authorize(Role.Admin), getAll);
router.get('/employee/:employeeId', authorize(), getByEmployee);
router.get('/:id', authorize(), getById);
router.post('/', authorize(), validation.createSchema, create);
router.put('/:id', authorize(Role.Admin), validation.updateSchema, update);
router.delete('/:id', authorize(Role.Admin), _delete);

module.exports = router;

function getAll(req, res, next) {
    requestService.getAll()
        .then(requests => res.json(requests))
        .catch(next);
}

function getById(req, res, next) {
    // users can get their own requests and admins can get any request
    getRequestIfAuthorized(req)
        .then(request => request ? res.json(request) : res.sendStatus(404))
        .catch(next);
}

function getByEmployee(req, res, next) {
    // users can get their own employee requests and admins can get any employee's requests
    if (req.params.employeeId !== req.user.employeeId && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    requestService.getByEmployeeId(req.params.employeeId)
        .then(requests => res.json(requests))
        .catch(next);
}

function create(req, res, next) {
    // set employee id from authenticated user if not provided
    if (!req.body.employeeId) {
        req.body.employeeId = req.user.employeeId;
    }
    
    // validate that user can only create requests for themselves unless admin
    if (req.body.employeeId !== req.user.employeeId && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized to create requests for other employees' });
    }
    
    requestService.create(req.body)
        .then(request => res.json(request))
        .catch(next);
}

function update(req, res, next) {
    getRequestIfAuthorized(req)
        .then(request => requestService.update(req.params.id, req.body))
        .then(request => res.json(request))
        .catch(next);
}

function _delete(req, res, next) {
    getRequestIfAuthorized(req)
        .then(request => requestService.delete(req.params.id))
        .then(() => res.json({ message: 'Request deleted successfully' }))
        .catch(next);
}

// helper functions

async function getRequestIfAuthorized(req) {
    const request = await requestService.getById(req.params.id);
    
    // make sure the user is authorized to access the request
    if (request.employeeId !== req.user.employeeId && req.user.role !== Role.Admin) {
        throw 'Unauthorized';
    }
    
    return request;
} 