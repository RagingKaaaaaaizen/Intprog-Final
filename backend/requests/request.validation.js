const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');

module.exports = {
    createSchema,
    updateSchema
};

function createSchema(req, res, next) {
    const schema = Joi.object({
        employeeId: Joi.number().required(),
        type: Joi.string().required(),
        status: Joi.string().valid('Pending', 'Approved', 'Rejected', 'Completed').default('Pending'),
        notes: Joi.string().allow(null, ''),
        items: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                quantity: Joi.number().default(1),
                notes: Joi.string().allow(null, '')
            })
        ).required().min(1)
    });
    validateRequest(req, next, schema);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        type: Joi.string().empty(''),
        status: Joi.string().valid('Pending', 'Approved', 'Rejected', 'Completed').empty(''),
        notes: Joi.string().allow(null, ''),
        items: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                quantity: Joi.number().default(1),
                status: Joi.string().valid('Pending', 'Approved', 'Rejected', 'Completed').default('Pending'),
                notes: Joi.string().allow(null, '')
            })
        )
    }).min(1);
    validateRequest(req, next, schema);
} 