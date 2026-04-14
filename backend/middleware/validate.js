module.exports = (schema) => (req, res, next) => {
    const { error } = schema.validate(
        {
            body: req.body,
            params: req.params,
            query: req.query
        },
        {
            abortEarly: false
        }
    )

    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.details.map((d) => d.message)
        })
    }
    next();
}