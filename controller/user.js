const { findUserByLoginId, searchFriends, updateUserPassword, searchUnknowns, createNewUser, updateUserName } = require('../classes/Users/Users')
const { ERROR } = require('../errorConstants')
const utils = require('../utils')
const { isEmailValid, isPhoneValid } = require('../classes/Users/Functions')
const { PLACEHOLDER } = require('../classes/Users/Constants')
const { SUCCESS } = require('../text')

/**
 * Checks if a user already exists or is a new user
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.verifyIfUserExists = async(req, res, next) => {
    console.log(req.body, req.baseUrl)

    let loginParam = req.body.loginid || ""

    if(!loginParam) {
        res.send(utils.sendResponse(false, {}, ERROR.parameters_missing))
        return
    }

    if(!isEmailValid(loginParam) && !isPhoneValid(loginParam)) {
        res.send(utils.sendResponse(false, {}, ERROR.invalid_email_phoneno))
        return
    }

    let findQueryResponse = await findUserByLoginId(loginParam)
    let responseData = findQueryResponse.data

    if(responseData == null) {
        res.send(utils.sendResponse(false, {}, ERROR.user_doesnot_exist))
        return
    }

    let data = {
        "loginid": responseData.loginid,
        "name": responseData.name,
    }

    res.send(utils.sendResponse(true, data, PLACEHOLDER.empty_string))
}

/**
 * Handles user login
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.userLogin = async(req, res, next) => {
    console.log(req.body, req.baseUrl, req.url)

    let loginParam = req.body.loginid || ""
    let password = req.body.password || ""

    if(!loginParam || !password) {
        res.send(utils.sendResponse(false, {}, ERROR.parameters_missing))
        return
    }

    if(!isEmailValid(loginParam) && !isPhoneValid(loginParam)) {
        res.send(utils.sendResponse(false, {}, ERROR.invalid_email_phoneno))
        return
    }

    let findQueryResponse = await findUserByLoginId(loginParam)
    let responseData = findQueryResponse.data

    if(responseData == null) {
        res.send(utils.sendResponse(false, {}, ERROR.user_doesnot_exist))
        return
    }

    if(responseData.password !== password) {
        res.send(utils.sendResponse(false, {}, ERROR.invalid_password))
        return
    }

    let data = {
        "userId": responseData.id,
    }

    res.send(utils.sendResponse(true, data, PLACEHOLDER.empty_string))
}

/**
 * Handles new user signup
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.userSignup = async(req, res, next) => {
    let name = req.body.name || ""
    let loginParam = req.body.loginid || ""
    let password = req.body.password || ""
    let repassword = req.body.repassword || ""

    if(!name || !loginParam || !password || !repassword) {
        res.send(utils.sendResponse(false, {}, ERROR.parameters_missing))
        return
    }

    if(!isEmailValid(loginParam) && !isPhoneValid(loginParam)) {
        res.send(utils.sendResponse(false, {}, ERROR.invalid_email_phoneno))
        return
    }

    let findQueryResponse = await findUserByLoginId(loginParam)
    let queryData = findQueryResponse.data

    if(queryData != null) {
        res.send(utils.sendResponse(false, {}, ERROR.user_already_exists))
        return
    }

    if(password !== repassword) {
        res.send(utils.sendResponse(false, {}, ERROR.invalid_password))
        return
    }

    let createQueryResponse = await createNewUser(name, loginParam, password)
    queryData = createQueryResponse.data

    let data = {
        "loginid": queryData.loginid,
        "name": queryData.name,
    }

    res.send(utils.sendResponse(true, data, PLACEHOLDER.empty_string))
}

/**
 * Update's users name or password or both
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.updateUserProfile = async(req, res, next) => {
    console.log(req.body, req.url)

    let loginParam = req.body.loginId || ""
    let oldPassword = req.body.oldPassword || ""
    let password = req.body.password || ""
    let rePassword = req.body.rePassword || ""
    let newName = req.body.name || ""

    if(!loginParam || !oldPassword || ((!password || !rePassword) && newName == null)) {
        res.send(utils.sendResponse(false, {}, ERROR.parameters_missing))
        return
    }

    if(!isEmailValid(loginParam) && !isPhoneValid(loginParam)) {
        res.send(utils.sendResponse(false, {}, ERROR.invalid_email_phoneno))
        return
    }

    let findQueryResponse = await findUserByLoginId(loginParam)
    let responseData = findQueryResponse.data

    if(responseData == null) {
        res.send(utils.sendResponse(false, {}, ERROR.user_doesnot_exist))
        return
    }

    if(password !== rePassword) {
        res.send(utils.sendResponse(false, {}, ERROR.invalid_password))
        return
    }

    if(responseData.password != oldPassword) {
        res.send(utils.sendResponse(false, {}, ERROR.invalid_password))
        return
    }

    let updateQuery

    if(newName != null && newName != '') {
        updateQuery = await updateUserName(newName, loginParam)
    }

    if(password != null && rePassword != null && password != '' && rePassword != '') {
        updateQuery = await updateUserPassword(password, loginParam)
    }

    res.send(utils.sendResponse(true, SUCCESS.profile_updated, PLACEHOLDER.empty_string))
}

/**
 * Search user (friends and unknowns) by name or id
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.userSearch = async (req, res, next) => {
    console.log(req.body, req.url)

    let searchText = req.body.searchText || ""// Search text matches with what is stored in loginid
    let currentUserId = req.body.currentUserId || -1

    if (!searchText) {
        res.send(utils.sendResponse(false, {}, ERROR.parameters_missing))
        return
    }

    let searchFriendsQuery = await searchFriends(searchText, currentUserId)
    let queryResultData = searchFriendsQuery.data

    if (queryResultData.length != 0) {
        if(queryResultData[0].Relationships.length > 0) {
            let status = queryResultData[0].Relationships[0].status
            if(status == 0) {
                queryResultData[0]['friendshipStatus'] = "pending"
            }
            else if(status == 1) {
                queryResultData[0]['friendshipStatus'] = "accepted"
            }
            else if(status == 2) {
                queryResultData[0]['friendshipStatus'] = "declined"
            }
            else {
                queryResultData[0]['friendshipStatus'] = "database ded"
            }
        }
        
        res.send(utils.sendResponse(true, queryResultData, PLACEHOLDER.empty_string))
        return
    }

    let searchUnknownQuery = await searchUnknowns(searchText, currentUserId)
    queryResultData = searchUnknownQuery.data
    queryResultData[0]['friendshipStatus'] = "unknown"

    if (queryResultData.length == 0) {
        res.send(utils.sendResponse(false, {}, ERROR.user_doesnot_exist))
        return
    }

    for (let i = 0; i < queryResultData.length; i++) {
        queryResultData[i].Relationships = [];
    }

    res.send(utils.sendResponse(true, queryResultData, PLACEHOLDER.empty_string))
}
