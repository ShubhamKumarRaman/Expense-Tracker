const { successResponse } = require('../utils/apiResponse')
const authService = require('../services/authService')
const { generateToken } = require('../utils/token')

exports.register = async (req, res, next) => {
    try {
        const user = await authService.createUser(req.body);
        const token = generateToken({ id: user._id, email: user.email })
        return successResponse(res, {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        }, "Registered", 201)
    } catch (err) {
        next(err);
    }
}

exports.login = async (req, res, next) => {
    try {
        const user = await authService.verifyUser(req.body);
        const token = generateToken({ id: user._id, email: user.email });

        return successResponse(res, {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        }, "Logged in");
    } catch (err) {
        next(err);
    }
}