const users = require('../classes/Users/Users')
const error = require('../errorConstants')
const utils = require('../utils')
const functions = require('../classes/Users/Functions')
const constants = require('../classes/Users/Constants')
const text = require('../text')
const relationships = require('../classes/Relationships/Relationships')

/**
 * Checks if a user already exists or is a new user
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.verifyIfUserExists = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let loginParam = req.body.loginid || ""
    loginParam = loginParam.toString()

    if (loginParam.length === 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.parameters_missing)
    }

    if (!functions.isEmailValid(loginParam) && !functions.isPhoneValid(loginParam)) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.invalid_email_phoneno)
    }

    let findQueryResponse = await users.findUserByLoginId(loginParam)
    let responseData = findQueryResponse.data

    if (responseData == null) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.user_doesnot_exist)
    }

    let data = {
        "loginid": responseData.loginid,
        "name": responseData.name,
    }

    return utils.sendResponse(res, true, data, constants.PLACEHOLDER.empty_string)
}

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

    let data = {
        "userId": responseData.id,
    }

    return utils.sendResponse(res, true, data, constants.PLACEHOLDER.empty_string)
}

/**
 * Handles new user signup
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.userSignup = async (req, res, next) => {
    let name = req.body.name || ""
    let loginParam = req.body.loginid || ""
    let password = req.body.password || ""
    let repassword = req.body.repassword || ""

    name = name.toString()
    loginParam = loginParam.toString()
    password = password.toString()
    repassword = repassword.toString()

    if (name.length === 0 || loginParam.length === 0 || password.length === 0 || repassword.length === 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.parameters_missing)
    }

    if (!functions.isEmailValid(loginParam) && !functions.isPhoneValid(loginParam)) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.invalid_email_phoneno)
    }

    let findQueryResponse = await users.findUserByLoginId(loginParam)
    let queryData = findQueryResponse.data

    if (queryData !== null) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.user_already_exists)
    }

    if (password !== repassword) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.invalid_password)
    }

    let createQueryResponse = await users.createNewUser(name, loginParam, password)
    queryData = createQueryResponse.data

    let data = {
        "loginid": queryData.loginid,
        "name": queryData.name,
    }

    return utils.sendResponse(res, true, data, constants.PLACEHOLDER.empty_string)
}

/**
 * Update's users name or password or both
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.updateUserProfile = async (req, res, next) => {
    console.log(req.body, req.url)

    let loginParam = req.body.loginId || ""
    let oldPassword = req.body.oldPassword || ""
    let password = req.body.password || ""
    let rePassword = req.body.rePassword || ""
    let newName = req.body.name || ""

    loginParam = loginParam.toString()
    oldPassword = oldPassword.toString()
    password = password.toString()
    rePassword = rePassword.toString()
    newName = newName.toString()

    if (loginParam.length === 0 || oldPassword.length === 0 || ((password.length === 0 || rePassword.length === 0) && newName.length === 0)) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.parameters_missing)
    }

    if (!functions.isEmailValid(loginParam) && !functions.isPhoneValid(loginParam)) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.invalid_email_phoneno)
    }

    let findQueryResponse = await users.findUserByLoginId(loginParam)

    if (findQueryResponse.data === null) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.user_doesnot_exist)
    }

    if (password !== rePassword) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.invalid_password)
    }

    if (findQueryResponse.data.password !== oldPassword) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.invalid_password)
    }

    let updateQuery = {}

    if (newName !== null && newName !== '') {
        updateQuery = await users.updateUserName(newName, loginParam)
    }

    if (password !== null && rePassword !== null && password !== '' && rePassword !== '') {
        updateQuery = await users.updateUserPassword(password, loginParam)
    }

    return utils.sendResponse(res, true, text.TEXT.profile_updated, constants.PLACEHOLDER.empty_string)
}

/**
 * Search user (friends and unknowns) by name or id
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.userSearch = async (req, res, next) => {
    console.log(req.body, req.url)

    let searchText = req.body.searchText || "" // Search text matches with what is stored in loginid
    let currentUserId = req.body.userId || -1

    searchText = searchText.toString()
    currentUserId = Number.parseInt(currentUserId)

    if (searchText.length === 0 || currentUserId <= 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.parameters_missing)
    }

    let searchFriendsQuery = await users.searchFriends(searchText, currentUserId)
    let friendSearchArray = searchFriendsQuery.data

    if (friendSearchArray.length != 0) {

        for (let itr = 0; itr < friendSearchArray.length; itr++) {
            if (friendSearchArray[itr].Relationships.length > 0) {
                let status = friendSearchArray[itr].Relationships[0].status
                if (status == 0) {
                    friendSearchArray[itr]['friendshipStatus'] = "pending"
                }
                else if (status == 1) {
                    friendSearchArray[itr]['friendshipStatus'] = "accepted"
                }
                else if (status == 2) {
                    friendSearchArray[itr]['friendshipStatus'] = "declined"
                }
                else {
                    friendSearchArray[itr]['friendshipStatus'] = "database ded"
                }
            }
        }

        //return utils.sendResponse(res, true, queryResultData, constants.PLACEHOLDER.empty_string)
    }

    let searchUnknownQuery = await users.searchUnknowns(searchText, currentUserId)
    let publicSearchArray = searchUnknownQuery.data

    if (publicSearchArray.length === 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.user_doesnot_exist)
    }

    for (let i = 0; i < publicSearchArray.length; i++) {
        publicSearchArray[i].Relationships = []
        publicSearchArray[i]['friendshipStatus'] = "unknown"
    }

    publicSearchArray = friendSearchArray.concat(publicSearchArray)
    return utils.sendResponse(res, true, publicSearchArray, constants.PLACEHOLDER.empty_string)
}

/**
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.getFriendRequestList = async (req, res, next) => {
    console.log(req.params, req.url)

    let userId = req.body.userId || -1
    userId = Number.parseInt(userId)

    await functions.validateUser(res, userId)

    let requestListQuery = await relationships.friendRequestList(userId)

    if(requestListQuery.success === false) {
        utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.query_error)
    }

    requestListQuery.data = functions.reFormatFriendList(requestListQuery.data)

    utils.sendResponse(res, true, requestListQuery.data, constants.PLACEHOLDER.empty_string)
}
