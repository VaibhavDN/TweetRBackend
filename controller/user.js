const Users = require('../classes/Users/Users')
const Functions = require('../classes/Users/Functions')
const Relationships = require('../classes/Relationships/Relationships')

const DBTOFRIENDSTATUS = require('../classes/Users/Constants').DBTOFRIENDSTATUS
const error = require('../errorConstants').ERROR
const utils = require('../utils')
const text = require('../text').TEXT

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
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    if (!Functions.isEmailValid(loginParam) && !Functions.isPhoneValid(loginParam)) {
        return utils.sendResponse(res, false, {}, error.invalid_email_phoneno)
    }

    let findQueryResponse = await Users.findUserByLoginId(loginParam)

    if (findQueryResponse.data == null) {
        return utils.sendResponse(res, false, {}, error.user_doesnot_exist)
    }

    let data = {
        "loginid": findQueryResponse.data.loginid,
        "name": findQueryResponse.data.name,
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
    let name = req.body.name || ""
    let loginParam = req.body.loginid || ""
    let password = req.body.password || ""
    let repassword = req.body.repassword || ""

    name = name.toString()
    loginParam = loginParam.toString()
    password = password.toString()
    repassword = repassword.toString()

    if (name.length === 0 || loginParam.length === 0 || password.length === 0 || repassword.length === 0) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    if ((!Functions.isEmailValid(loginParam) && !Functions.isPhoneValid(loginParam)) || !Functions.isNameValid(name)) {
        return utils.sendResponse(res, false, {}, error.invalid_email_phoneno_name)
    }

    let findQueryResponse = await Users.findUserByLoginId(loginParam)

    if (findQueryResponse.data !== null) {
        return utils.sendResponse(res, false, {}, error.user_already_exists)
    }

    if (password !== repassword) {
        return utils.sendResponse(res, false, {}, error.invalid_password)
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
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    if (!Functions.isEmailValid(loginParam) && !Functions.isPhoneValid(loginParam)) {
        return utils.sendResponse(res, false, {}, error.invalid_email_phoneno)
    }

    let findQueryData = (await Users.findUserByLoginId(loginParam)).data

    if (findQueryData === null) {
        return utils.sendResponse(res, false, {}, error.user_doesnot_exist)
    }

    if (password !== rePassword) {
        return utils.sendResponse(res, false, {}, error.invalid_password)
    }

    if (findQueryData.password !== oldPassword) {
        return utils.sendResponse(res, false, {}, error.invalid_password)
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
    console.log(req.body, req.url)

    let searchText = req.body.searchText || "" // Search text matches with what is stored in loginid
    let userId = req.userId

    searchText = searchText.toString()
    userId = parseInt(userId)

    if (searchText.length === 0 || Number.isNaN(userId)) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    let friendSearchArray = (await Users.searchFriends(searchText, userId)).data

    if (friendSearchArray.length != 0) {

        for (let itr = 0; itr < friendSearchArray.length; itr++) {
            if (friendSearchArray[itr].Relationships.length > 0) {
                let status = friendSearchArray[itr].Relationships[0].status
                
                if(Object.keys(DBTOFRIENDSTATUS).includes(status)) {
                    friendSearchArray[itr]['friendshipStatus'] = DBTOFRIENDSTATUS[status]
                }
            }
        }
    }

    let publicSearchArray = (await Users.searchUnknowns(searchText, userId)).data

    if (publicSearchArray.length === 0) {
        return utils.sendResponse(res, false, {}, error.user_doesnot_exist)
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
    console.log(req.body, req.url)

    let userId = req.userId
    userId = parseInt(userId)

    if (Number.isNaN(userId)) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    await Functions.validateUser(res, userId)

    let requestListQuery = await Relationships.friendRequestList(userId)

    if(requestListQuery.success === false) {
        utils.sendResponse(res, false, {}, error.query_error)
    }

    requestListQuery.data = Functions.reFormatFriendList(requestListQuery.data)

    utils.sendResponse(res, true, requestListQuery.data, "")
}
