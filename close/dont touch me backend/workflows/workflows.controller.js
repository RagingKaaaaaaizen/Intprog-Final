const express = require('express');
const router = express.Router();
const Joi = require('joi');
const workflowService = require('./workflow.service');
const validation = require('./workflow.validation');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');
const validate = require('../_middleware/validate-request');

// routes
router.get('/', authorize(Role.Admin), getAll);
router.get('/employee/:employeeId', authorize(), getByEmployee);
router.get('/:id', authorize(), getById);
router.post('/', authorize(Role.Admin), validation.createSchema, create);
router.post('/onboarding', authorize(Role.Admin), createOnboarding);
router.put('/:id/status', authorize(Role.Admin), validation.updateStatusSchema, updateStatus);

module.exports = router;

function getAll(req, res, next) {
    workflowService.getAll()
        .then(workflows => res.json(workflows))
        .catch(next);
}

function getById(req, res, next) {
    workflowService.getById(req.params.id)
        .then(workflow => workflow ? res.json(workflow) : res.sendStatus(404))
        .catch(next);
}

function getByEmployee(req, res, next) {
    workflowService.getByEmployeeId(req.params.employeeId)
        .then(workflows => res.json(workflows))
        .catch(next);
}

function create(req, res, next) {
    workflowService.create(req.body)
        .then(workflow => res.json(workflow))
        .catch(next);
}

function createOnboarding(req, res, next) {
    const schema = Joi.object({
        employeeId: Joi.number().required()
    });
    
    validate(req, next, schema);
    
    workflowService.createOnboarding(req.body.employeeId)
        .then(workflow => res.json(workflow))
        .catch(next);
}

function updateStatus(req, res, next) {
    workflowService.updateStatus(req.params.id, req.body)
        .then(workflow => res.json(workflow))
        .catch(next);
} 