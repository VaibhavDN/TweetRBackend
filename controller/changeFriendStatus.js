const { checkAlreadyFriends, createFriendRequest, changeRequestStatus } = require('../classes/Relationships/Relationships')
const { FRIENDSTATUS, ERRORCODE, PLACEHOLDER } = require('../classes/Relationships/Constants')
const { TEXT } = require('../text')
const { ERROR } = require('../errorConstants')
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
    let status = req.body.status || -1 // 0 Pending 1 Accepted 2 Declined

    currentUserId = Number.parseInt(currentUserId)
    friendUserId = Number.parseInt(friendUserId)
    status = Number.parseInt(status)

    if(currentUserId <= 0 || friendUserId <= 0 || status <= 0 || status >= 3) {
        return res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
    }

    if (status == FRIENDSTATUS.pending) {
        let friendRequestExists = await checkAlreadyFriends(currentUserId, friendUserId)
        friendRequestExistsData = friendRequestExists.data

        if (friendRequestExistsData != null) {
            res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.request_exists))
            return
        }

        let createFriendQuery = await createFriendRequest(currentUserId, friendUserId)
        createFriendQueryData = createFriendQuery.data

        res.send(utils.sendResponse(true, createFriendQueryData, PLACEHOLDER.empty_string))
        return
    }
    else if (status == FRIENDSTATUS.accepted || status == FRIENDSTATUS.declined) {
        let changeFriendQuery = await changeRequestStatus(currentUserId, friendUserId, status)

        if (changeFriendQuery.data[0] == ERRORCODE.zero) {
            res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.request_doesnot_exist))
            return
        }

        res.send(utils.sendResponse(true, TEXT.friend_request_updated, PLACEHOLDER.empty_string))
        return

    }

    res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.status_change_failed))
}
