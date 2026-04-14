const Joi = require('joi')

exports.registerSchema = Joi.object(
    {
        body: Joi.object({
            name: Joi.string().min(2).max(100).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(30).required()
        }).required(),
        params: Joi.object({}).unknown(true),
        query: Joi.object({}).unknown(true)
    }
);

exports.loginSchema = Joi.object(
    {
        body: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        }).required(),
        params: Joi.object({}).unknown(true),
        query: Joi.object({}).unknown(true)
    }
)