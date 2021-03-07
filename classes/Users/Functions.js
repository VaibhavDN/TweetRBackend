const Users = require("../Users/Users")

const utils = require('../../utils')
const ERROR = require('../../errorConstants').ERROR
const DBTOFRIENDSTATUS = require('./Constants').DBTOFRIENDSTATUS

/**
 * Checks if email is valid using regex
 * @param {String} email 
 */
const isEmailValid = (email) => {
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
const isPhoneValid = (phone) => {
    let regex = /^[6-9]\d{9}$/
    if(regex.test(phone) === false && phone != null) {
        return false
    }

    return true
}

/**
 * Checks if name is valid using regex
 * @param {String} name 
 */
 const isNameValid = (name) => {
    let regex = /^[A-Za-z.-]+(\s*[A-Za-z.-]+)*$/
    if(regex.test(name) === false && name != null) {
        return false
    }

    return true
}

/**
 * Checks if user with userId exists in the database
 * @param {Object} res 
 * @param {Integer} userId 
 */
const validateUser = async (res, userId) => {
    let userExistsQuery = await Users.findIfUserExists(userId)

    if (userExistsQuery.data == null || userExistsQuery.success == false) {
        utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
        return
    }
}

/**
 * Re-Formats data from friend request list
 * Converts numeric status to string status.
 * @param {Array} data 
 */
const reFormatFriendList = (data) => {
    for(let itr = 0; itr < data.length; itr++) {
        data[itr].status = DBTOFRIENDSTATUS[data[itr].status]
    }

    return data
}

module.exports = {
    isEmailValid,
    isPhoneValid,
    isNameValid,
    validateUser,
    reFormatFriendList,
}
