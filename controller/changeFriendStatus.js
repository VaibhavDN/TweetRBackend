const Relationships = require('../classes/Relationships/Relationships')
const Constants = require('../classes/Relationships/Constants')
const Functions = require('../classes/Relationships/Functions')

const text = require('../text').TEXT
const error = require('../errorConstants').ERROR
const utils = require('../utils')

/**
 * Friend request controller
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.friendRequest = async (req, res, next) => {
    console.log(req.body, req.baseUrl, req.url)

    let userId = req.userId
    let friendUserId = req.body.friendUserId
    let status = req.body.status || ""

    userId = parseInt(userId)
    friendUserId = parseInt(friendUserId)
    status = status.toString()

    if(isNaN(userId) || isNaN(friendUserId) || status.length === 0) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    console.log(userId, friendUserId)
    await Functions.validateUser(res, userId)
    await Functions.validateUser(res, friendUserId)

    status = Constants.FRIENDSTATUS[status]

    if (status === Constants.FRIENDSTATUS.pending) {
        let friendRequestExists = await Relationships.checkAlreadyFriends(userId, friendUserId)

        if (friendRequestExists.data !== null) {
            return utils.sendResponse(res, false, {}, error.request_exists)
        }

        let createFriendQuery = await Relationships.createFriendRequest(userId, friendUserId)

        return utils.sendResponse(res, true, createFriendQuery.data, "")
    }
    else if (status === Constants.FRIENDSTATUS.accepted || status === Constants.FRIENDSTATUS.declined) {
        let changeFriendData = (await Relationships.changeRequestStatus(userId, friendUserId, status)).data
        
        if (changeFriendData[0] === Constants.ERRORCODE.zero) {
            return utils.sendResponse(res, false, {}, error.request_doesnot_exist)
        }

        return utils.sendResponse(res, true, text.friend_request_updated, "")
    }

    return utils.sendResponse(res, false, {}, error.status_change_failed)
}
