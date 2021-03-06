const jwt = require('jsonwebtoken')

const Users = require('../classes/Users/Users')

const Functions = require('../classes/Users/Functions')
const error = require('../errorConstants').ERROR
const utils = require('../utils')
const authConfig = require('../config/authConfig')

/**
 * Handles user login and sends back userId and JWT token
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
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    if (!Functions.isEmailValid(loginParam) && !Functions.isPhoneValid(loginParam)) {
        return utils.sendResponse(res, false, {}, error.invalid_email_phoneno)
    }

    let responseData = (await Users.findUserByLoginId(loginParam)).data

    if (responseData === null) {
        return utils.sendResponse(res, false, {}, error.user_doesnot_exist)
    }

    if (responseData.password !== password) {
        return utils.sendResponse(res, false, {}, error.invalid_password)
    }

    let token = jwt.sign({ id: responseData.id }, authConfig.secret, {
        expiresIn: 1800 // 30 minutes
    })

    let data = {
        "userId": responseData.id,
        "token": token,
    }

    return utils.sendResponse(res, true, data, "")
}