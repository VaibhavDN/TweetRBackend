const users = require("../Users/Users")
const utils = require('../../utils')
const constants = require('./Constants')
const errors = require('../../errorConstants')

/**
 * Checks if user with userId exists in the database
 * @param {Object} res 
 * @param {Integer} userId 
 */
exports.validateUser = async (res, userId) => {
    let userExistsQuery = await users.findIfUserExists(userId)
    let userExistsQueryStatus = userExistsQuery.success

    if (userExistsQuery.data == null || userExistsQueryStatus == false) {
        utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errors.ERROR.user_doesnot_exist)
        return
    }
}
