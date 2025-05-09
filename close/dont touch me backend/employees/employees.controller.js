const express = require('express');
const router = express.Router();
const employeeService = require('./employee.service');
const validation = require('./employee.validation');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

// routes
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);
router.post('/', authorize(Role.Admin), validation.createSchema, create);
router.put('/:id', authorize(Role.Admin), validation.updateSchema, update);
router.delete('/:id', authorize(Role.Admin), _delete);
router.post('/:id/transfer', authorize(Role.Admin), validation.transferSchema, transfer);

module.exports = router;

function getAll(req, res, next) {
    employeeService.getAll()
        .then(employees => res.json(employees))
        .catch(next);
}

function getById(req, res, next) {
    employeeService.getById(req.params.id)
        .then(employee => employee ? res.json(employee) : res.sendStatus(404))
        .catch(next);
}

function create(req, res, next) {
    employeeService.create(req.body)
        .then(employee => res.json(employee))
        .catch(next);
}

function update(req, res, next) {
    employeeService.update(req.params.id, req.body)
        .then(employee => res.json(employee))
        .catch(next);
}

function _delete(req, res, next) {
    employeeService.delete(req.params.id)
        .then(() => res.json({ message: 'Employee deleted successfully' }))
        .catch(next);
}

function transfer(req, res, next) {
    employeeService.transfer(req.params.id, req.body)
        .then(employee => res.json(employee))
        .catch(next);
} 