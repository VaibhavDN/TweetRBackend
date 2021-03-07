const Users = require("../Users/Users")

const utils = require('../../utils')
const errors = require('../../errorConstants').ERROR

/**
 * Checks if user with userId exists in the database
 * @param {Object} res 
 * @param {Integer} userId 
 */
const validateUser = async (res, userId) => {
    let userExistsQuery = await Users.findIfUserExists(userId)

    if (userExistsQuery.data == null || userExistsQuery.success == false) {
        utils.sendResponse(res, false, {}, errors.user_doesnot_exist)
        return
    }
}

module.exports = {
    validateUser,
}
