const express = require('express');
const router = express.Router();
const departmentService = require('./department.service');
const validation = require('./department.validation');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

// routes
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);
router.post('/', authorize(Role.Admin), validation.createSchema, create);
router.put('/:id', authorize(Role.Admin), validation.updateSchema, update);
router.delete('/:id', authorize(Role.Admin), _delete);

module.exports = router;

function getAll(req, res, next) {
    departmentService.getAll()
        .then(departments => res.json(departments))
        .catch(next);
}

function getById(req, res, next) {
    departmentService.getById(req.params.id)
        .then(department => department ? res.json(department) : res.sendStatus(404))
        .catch(next);
}

function create(req, res, next) {
    departmentService.create(req.body)
        .then(department => res.json(department))
        .catch(next);
}

function update(req, res, next) {
    departmentService.update(req.params.id, req.body)
        .then(department => res.json(department))
        .catch(next);
}

function _delete(req, res, next) {
    departmentService.delete(req.params.id)
        .then(() => res.json({ message: 'Department deleted successfully' }))
        .catch(next);
} 