const relationships = require('../classes/Relationships/Relationships')
const constants = require('../classes/Relationships/Constants')
const text = require('../text')
const error = require('../errorConstants')
const utils = require('../utils')

/**
 * Friend request controller
 * Status values:
 * Sends friend request -> 0
 * Accepts friend request -> 1
 * Decline friend request -> 2
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.friendRequest = async (req, res, next) => {
    console.log(JSON.stringify(req.body), req.baseUrl, req.url)

    let currentUserId = req.body.currentUserId || -1
    let friendUserId = req.body.friendUserId || -1
    let status = req.body.status || ""

    currentUserId = Number.parseInt(currentUserId)
    friendUserId = Number.parseInt(friendUserId)
    status = status.toString()

    if(currentUserId <= 0 || friendUserId <= 0 || status.length === 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.parameters_missing)
    }

    status = constants.FRIENDSTATUS[status]

    if (status === constants.FRIENDSTATUS.pending) {
        let friendRequestExists = await relationships.checkAlreadyFriends(currentUserId, friendUserId)
        friendRequestExistsData = friendRequestExists.data

        if (friendRequestExistsData !== null) {
            return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.request_exists)
        }

        let createFriendQuery = await relationships.createFriendRequest(currentUserId, friendUserId)
        createFriendQueryData = createFriendQuery.data

        return utils.sendResponse(res, true, createFriendQueryData, constants.PLACEHOLDER.empty_string)
    }
    else if (status === constants.FRIENDSTATUS.accepted || status === constants.FRIENDSTATUS.declined) {
        let changeFriendQuery = await relationships.changeRequestStatus(currentUserId, friendUserId, status)

        if (changeFriendQuery.data[0] == constants.ERRORCODE.zero) {
            return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.request_doesnot_exist)
        }

        return utils.sendResponse(res, true, text.TEXT.friend_request_updated, constants.PLACEHOLDER.empty_string)
    }

    return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.status_change_failed)
}
