const jwt = require('jsonwebtoken')
const { signOptions } = require('../config/jwt')

exports.generateToken = (payload) => {
    jwt.sign(payload, process.env.JWT_SECRET, signOptions);
}