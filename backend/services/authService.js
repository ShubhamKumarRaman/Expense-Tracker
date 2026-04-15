const bcrypt = require('bcryptjs')
const User = require('../models/User')

exports.createUser = async ({ name, email, password }) => {
    const exists = await User.findOne({ email });

    if (exists) {
        throw Object.assign(new Error("Email already registered"), { statusCode: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    return User.create({ name, email, password: hashed });
}

exports.verifyUser = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 })
    }

    return user;
}