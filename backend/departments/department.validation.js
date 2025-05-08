const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');

module.exports = {
    createSchema,
    updateSchema
};

function createSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().allow(null, '')
    });
    validateRequest(req, next, schema);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().empty(''),
        description: Joi.string().allow(null, '').empty('')
    }).min(1);
    validateRequest(req, next, schema);
} 