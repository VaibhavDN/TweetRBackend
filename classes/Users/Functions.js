const users = require("../Users/Users")
const utils = require('../../utils')
const error = require('../../errorConstants')
const constants = require('./Constants')

/**
 * Checks if email is valid using regex
 * @param {String} email 
 */
exports.isEmailValid = (email) => {
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if(regex.test(email) === false && email != null) {
        return false
    }

    return true
}

/**
 * Checks if phone number is valid using regex
 * @param {String} phone 
 */
exports.isPhoneValid = (phone) => {
    let regex = /^[6-9]\d{9}$/
    if(regex.test(phone) === false && phone != null) {
        return false
    }

    return true
}

/**
 * Checks if user with userId exists in the database
 * @param {Object} res 
 * @param {Integer} userId 
 */
exports.validateUser = async (res, userId) => {
    let userExistsQuery = await users.findIfUserExists(userId)
    let userExistsQueryStatus = userExistsQuery.success

    if (userExistsQuery.data == null || userExistsQueryStatus == false) {
        utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.user_doesnot_exist)
        return
    }
}

/**
 * Re-Formats data from friend request list
 * Converts numeric status to string status.
 * @param {Array} data 
 */
exports.reFormatFriendList = (data) => {
    for(let itr = 0; itr < data.length; itr++) {
        data[itr].status = constants.DBTOFRIENDSTATUS[data[itr].status]
    }

    return data
}

