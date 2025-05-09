const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');

module.exports = {
    createSchema,
    updateStatusSchema
};

function createSchema(req, res, next) {
    const schema = Joi.object({
        employeeId: Joi.number().required(),
        type: Joi.string().required(),
        details: Joi.object().allow(null),
        status: Joi.string().valid('Pending', 'In Progress', 'Completed', 'Rejected').default('Pending')
    });
    validateRequest(req, next, schema);
}

function updateStatusSchema(req, res, next) {
    const schema = Joi.object({
        status: Joi.string().valid('Pending', 'In Progress', 'Completed', 'Rejected').required()
    });
    validateRequest(req, next, schema);
} 