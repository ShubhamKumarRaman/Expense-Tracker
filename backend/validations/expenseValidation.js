const Joi = require("joi")

exports.createExpenseSchema = Joi.object(
    {
        body: Joi.object({
            title: Joi.string().max(120).required(),
            amount: Joi.number().positive().required(),
            category: Joi.string().max(50).required(),
            date: Joi.date().optional(),
            notes: Joi.string().allow("").max(500).optional()
        }).required(),
        params: Joi.object({}).unknown(true),
        query: Joi.object({}).unknown(true)
    }
);