const jwt = require('jsonwebtoken')

const authConfig = require('../config/authConfig')
const utils = require('../utils')
const error = require('../errorConstants').ERROR

/**
 * Verifies JWT token sent by the frontend and sets 
 * the userId in the req object
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 * @returns 
 */
exports.verifyJWT = (req, res, next) => {
    let token = req.headers["x-access-token"] || ""
    token = token.toString()

    if (token.length === 0) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) {
            return utils.sendResponse(res, false, {}, error.unauthorized_token)
        }

        req.userId = decoded.id
        next()
    })
}