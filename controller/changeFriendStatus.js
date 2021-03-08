const utils = require('../utils')

const Relationships = require('../classes/Relationships/Relationships')
const Constants = require('../classes/Relationships/Constants')
const Functions = require('../classes/Relationships/Functions')

const text = require('../text').TEXT
const error = require('../errorConstants').ERROR

/**
 * Friend request controller
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.friendRequest = async (req, res, next) => {
    let body = req.body
    let userId = parseInt(req.userId)
    let friendUserId = parseInt(body.friendUserId)
    let status = body.status || ""

    if(utils.checkIsNaN(userId, friendUserId) || status.length === 0) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    if(!await Functions.validateUser(userId) || !await Functions.validateUser(friendUserId)) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    status = Constants.FRIENDSTATUS[status]

    if (status === Constants.FRIENDSTATUS.pending) {
        let friendRequestExists = await Relationships.checkAlreadyFriends(userId, friendUserId)

        if(friendRequestExists.success === false) {
            return utils.sendResponse(res, false, {}, ERROR.query_error)
        }

        if (friendRequestExists.data !== null) {
            return utils.sendResponse(res, false, {}, error.request_exists)
        }

        let createFriendQuery = await Relationships.createFriendRequest(userId, friendUserId)

        if(createFriendQuery.success === false) {
            return utils.sendResponse(res, false, {}, ERROR.query_error)
        }

        return utils.sendResponse(res, true, createFriendQuery.data, "")
    }
    else if (status === Constants.FRIENDSTATUS.accepted || status === Constants.FRIENDSTATUS.declined) {
        let changeFriendQuery = await Relationships.changeRequestStatus(userId, friendUserId, status)

        if(changeFriendQuery.success === false) {
            return utils.sendResponse(res, false, {}, ERROR.query_error)
        }
        
        if (changeFriendQuery.data[0] === Constants.ERRORCODE.zero) {
            return utils.sendResponse(res, false, {}, error.request_doesnot_exist)
        }

        return utils.sendResponse(res, true, text.friend_request_updated, "")
    }

    return utils.sendResponse(res, false, {}, error.status_change_failed)
}
