const users = require('../classes/Users/Users')
const error = require('../errorConstants')
const utils = require('../utils')
const functions = require('../classes/Users/Functions')
const constants = require('../classes/Users/Constants')
const jwt = require('jsonwebtoken')
const authConfig = require('../config/authConfig')

/**
 * Handles user login
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.userLogin = async (req, res, next) => {
    console.log(req.body, req.baseUrl, req.url)

    let loginParam = req.body.loginid || ""
    let password = req.body.password || ""

    loginParam = loginParam.toString()
    password = password.toString()

    if (loginParam.length === 0 || password.length === 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.parameters_missing)
    }

    if (!functions.isEmailValid(loginParam) && !functions.isPhoneValid(loginParam)) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.invalid_email_phoneno)
    }

    let findQueryResponse = await users.findUserByLoginId(loginParam)
    let responseData = findQueryResponse.data

    if (responseData === null) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.user_doesnot_exist)
    }

    if (responseData.password !== password) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.invalid_password)
    }

    let token = jwt.sign({ id: responseData.id }, authConfig.secret, {
        expiresIn: 1800 // 30 minutes
    })

    console.log(token)
    let data = {
        "userId": responseData.id,
        "token": token,
    }

    return utils.sendResponse(res, true, data, constants.PLACEHOLDER.empty_string)
}