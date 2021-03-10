const JWTstrategy = require('passport-jwt').Strategy
const passportJWT = require('passport-jwt')
const passport = require('passport')
const secret = require('../config/authConfig').secret

exports.passportStrategy = (passport) => {
    passport.use(
        new JWTstrategy({
            secretOrKey: secret,
            jwtFromRequest: passportJWT.ExtractJwt.fromHeader('x-access-token')
        }, async (token, done) => {
            return done(null, token.userId)
        })
    )
}

exports.authenticate = passport.authenticate('jwt', {
    session: false,
    failureFlash: 'Invalid token',
})

/*
exports.verifyJWT = (req, res, next) => {
    let token = req.headers["x-access-token"] || ""
    token = token.toString()

    if (token.length === 0) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) {
            return utils.sendResponse(res, false, {}, ERROR.unauthorized_token)
        }

        req.userId = decoded.id
        next()
    })
}
*/