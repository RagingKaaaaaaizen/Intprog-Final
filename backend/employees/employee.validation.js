const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');

module.exports = {
    createSchema,
    updateSchema,
    transferSchema
};

function createSchema(req, res, next) {
    const schema = Joi.object({
        employeeId: Joi.string().required(),
        position: Joi.string().required(),
        departmentId: Joi.number().required(),
        userId: Joi.number(),
        hireDate: Joi.date().default(new Date()),
        status: Joi.string().valid('Active', 'Inactive', 'On Leave').default('Active')
    });
    validateRequest(req, next, schema);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        employeeId: Joi.string().empty(''),
        position: Joi.string().empty(''),
        departmentId: Joi.number(),
        userId: Joi.number(),
        hireDate: Joi.date().empty(''),
        status: Joi.string().valid('Active', 'Inactive', 'On Leave').empty('')
    }).min(1);
    validateRequest(req, next, schema);
}

function transferSchema(req, res, next) {
    const schema = Joi.object({
        departmentId: Joi.number().required()
    });
    validateRequest(req, next, schema);
} 