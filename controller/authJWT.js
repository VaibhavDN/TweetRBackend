const jwt = require('jsonwebtoken')
const authConfig = require('../config/authConfig')
const utils = require('../utils')
const passport = require('passport')
const localStrategy = require('passport-local').Strategy

const User = require('../models/Users')
const validateUser = require('../classes/Users/Functions').validateUser

const ERROR = require('../errorConstants').ERROR

/**
 * Verifies JWT token sent by the frontend and sets 
 * the userId in the req object
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 * @returns 
 */
exports.verifyJWT = async (req, res, next) => {
    let token = req.headers["x-access-token"] || ""

    if (token.length === 0) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) {
            return utils.sendResponse(res, false, {}, ERROR.unauthorized_token)
        }

        let userId = decoded.id
        if(!validateUser(userId)) {
            return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
        }

        req.userId = userId
        next()
    })
}

