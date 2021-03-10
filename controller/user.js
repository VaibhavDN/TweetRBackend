const jwt = require('jsonwebtoken')
const atob = require('atob')
const utils = require('../utils')
const authConfig = require('../config/authConfig')

const Users = require('../classes/Users/Users')
const Functions = require('../classes/Users/Functions')
const Relationships = require('../classes/Relationships/Relationships')
const DBTOFRIENDSTATUS = require('../classes/Users/Constants').DBTOFRIENDSTATUS

const ERROR = require('../errorConstants').ERROR
const text = require('../text').TEXT

/**
 * Checks if a user already exists or is a new user
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.verifyIfUserExists = async (req, res, next) => {
    let loginParam = req.body.loginid || ""

    if (loginParam.length === 0) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if (!Functions.isEmailValid(loginParam) && !Functions.isPhoneValid(loginParam)) {
        return utils.sendResponse(res, false, {}, ERROR.invalid_email_phoneno)
    }

    let findQueryResponse = await Users.findUserByLoginId(loginParam)

    if (findQueryResponse.data == null || findQueryResponse.success == false) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    let data = {
        "loginid": findQueryResponse.data.loginid,
        "name": findQueryResponse.data.name,
    }

    return utils.sendResponse(res, true, data, "")
}

/**
 * Handles user login and sends back userId and JWT token
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.userLogin = async (req, res, next) => {
    let usernamePassword = decodeURIComponent(atob((req.headers.authorization).split(' ')[1]))
    let loginParam = usernamePassword.split(':')[0] || ""
    let password = usernamePassword.split(':')[1] || ""

    if (loginParam.length === 0 || password.length === 0) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if (!Functions.isEmailValid(loginParam) && !Functions.isPhoneValid(loginParam)) {
        return utils.sendResponse(res, false, {}, ERROR.invalid_email_phoneno)
    }

    let response = await Users.findUserByLoginId(loginParam)
    let responseData = response.data

    if(response.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (responseData === null) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    if (responseData.password !== password) {
        return utils.sendResponse(res, false, {}, ERROR.invalid_password)
    }

    let token = jwt.sign({ userId: responseData.id }, authConfig.secret, {
        expiresIn: 1800 // 30 minutes
    })

    let data = {
        "userId": responseData.id,
        "token": token,
    }

    return utils.sendResponse(res, true, data, "")
}

/**
 * Handles new user signup
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.userSignup = async (req, res, next) => {
    let body = req.body
    let name = body.name || ""
    let loginParam = body.loginid || ""
    let password = body.password || ""
    let repassword = body.repassword || ""

    if (name.length === 0 || loginParam.length === 0 || password.length === 0 || repassword.length === 0) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if ((!Functions.isEmailValid(loginParam) && !Functions.isPhoneValid(loginParam)) || !Functions.isNameValid(name)) {
        return utils.sendResponse(res, false, {}, ERROR.invalid_email_phoneno_name)
    }

    let findQueryResponse = await Users.findUserByLoginId(loginParam)

    if(findQueryResponse.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (findQueryResponse.data !== null) {
        return utils.sendResponse(res, false, {}, ERROR.user_already_exists)
    }

    if (password !== repassword) {
        return utils.sendResponse(res, false, {}, ERROR.invalid_password)
    }

    let createQueryResponse = await Users.createNewUser(name, loginParam, password)

    let data = {
        "loginid": createQueryResponse.data.loginid,
        "name": createQueryResponse.data.name,
    }

    return utils.sendResponse(res, true, data, "")
}

/**
 * Update's users name or password or both
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.updateUserProfile = async (req, res, next) => {
    let body = req.body
    let loginParam = body.loginId || ""
    let oldPassword = body.oldPassword || ""
    let password = body.password || ""
    let rePassword = body.rePassword || ""
    let newName = body.name || ""

    if (loginParam.length === 0 || oldPassword.length === 0 || ((password.length === 0 || rePassword.length === 0) && newName.length === 0)) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if (!Functions.isEmailValid(loginParam) && !Functions.isPhoneValid(loginParam)) {
        return utils.sendResponse(res, false, {}, ERROR.invalid_email_phoneno)
    }

    let findQueryResponse = await Users.findUserByLoginId(loginParam)
    let findQueryData = findQueryResponse.data

    if(findQueryResponse.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (findQueryData === null) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    if (password !== rePassword) {
        return utils.sendResponse(res, false, {}, ERROR.invalid_password)
    }

    if (findQueryData.password !== oldPassword) {
        return utils.sendResponse(res, false, {}, ERROR.invalid_password)
    }

    let updateQuery = {}

    if (newName !== null && newName !== '' && Functions.isNameValid(newName)) {
        updateQuery = await Users.updateUserName(newName, loginParam)
    }

    if (password !== null && rePassword !== null && password !== '' && rePassword !== '') {
        updateQuery = await Users.updateUserPassword(password, loginParam)
    }

    return utils.sendResponse(res, true, text.profile_updated, "")
}

/**
 * Search user (friends and unknowns) by name or id
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.userSearch = async (req, res, next) => {
    let searchText = req.body.searchText || "" // Search text matches with what is stored in loginid
    let userId = parseInt(req.user)

    if (searchText.length === 0 || utils.checkIsNaN(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    let friendSearch = await Users.searchFriends(searchText, userId)
    let friendSearchArray = friendSearch.data

    if(friendSearch.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (friendSearchArray.length != 0) {

        for (let itr = 0; itr < friendSearchArray.length; itr++) {
            if (friendSearchArray[itr].Relationships.length > 0) {
                let status = friendSearchArray[itr].Relationships[0].status

                if (Object.keys(DBTOFRIENDSTATUS).includes(status)) {
                    friendSearchArray[itr]['friendshipStatus'] = DBTOFRIENDSTATUS[status]
                }
            }
        }
    }

    let publicSearch = await Users.searchUnknowns(searchText, userId)
    let publicSearchArray = publicSearch.data

    if(publicSearch.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (publicSearchArray.length === 0) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    for (let i = 0; i < publicSearchArray.length; i++) {
        publicSearchArray[i].Relationships = []
        publicSearchArray[i]['friendshipStatus'] = "unknown"
    }

    publicSearchArray = friendSearchArray.concat(publicSearchArray)
    return utils.sendResponse(res, true, publicSearchArray, "")
}

/**
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.getFriendRequestList = async (req, res, next) => {
    let userId = parseInt(req.user)

    if (utils.checkIsNaN(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if (!await Functions.validateUser(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    let requestListQuery = await Relationships.friendRequestList(userId)

    if (requestListQuery.success === false) {
        utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    requestListQuery.data = Functions.reFormatFriendList(requestListQuery.data)

    utils.sendResponse(res, true, requestListQuery.data, "")
}
