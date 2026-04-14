module.exports = {
    signOptions:{
        expiresIn:process.env.JWT_EXPIRES_IN || '2d'
    }
}