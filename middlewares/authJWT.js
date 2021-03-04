const jwt = require('jsonwebtoken')
const authConfig = require('../config/authConfig')
const utils = require('../utils')
const error = require('../errorConstants')
const constants = require('./constants')

exports.verifyJWT = (req, res, next) => {
    let token = req.headers["x-access-token"] || ""
    token = token.toString()

    if (token.length === 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.parameters_missing)
    }

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) {
            return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.unauthorized_token)
        }

        //req.userId = decoded.id
        req.body.userId = decoded.id
        next()
    })
}