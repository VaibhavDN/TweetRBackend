const Users = require("../Users/Users")

/**
 * Checks if user with userId exists in the database
 * @param {Integer} userId 
 */
const validateUser = async (userId) => {
    let userExistsQuery = await Users.findIfUserExists(userId)

    if (userExistsQuery.data == null || userExistsQuery.success == false) {
        return false
    }

    return true
}

module.exports = {
    validateUser,
}
