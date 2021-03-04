const Relationships = require("../../models/Relationships")
const { Op } = require('sequelize')
const { ERROR } = require('../../errorConstants')
const { FRIENDSTATUS, PLACEHOLDER } = require("./Constants")
const utils = require('../../utils')
const User = require("../../models/Users")

/**
 * Checks if friend request already exists between two users
 * @param {Integer} currentUserId 
 * @param {Integer} friendUserId 
 */
exports.checkAlreadyFriends = async (currentUserId, friendUserId) => {
    let findFriendQuery = await Relationships.findOne({
        where: {
            [Op.or]: [
                {
                    [Op.and]: [
                        { userOneId: currentUserId },
                        { userTwoId: friendUserId },
                    ]
                },
                {
                    [Op.and]: [
                        { userOneId: friendUserId },
                        { userTwoId: currentUserId }, //Todo: Remove
                    ]
                }
            ]
        }
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, findFriendQuery, PLACEHOLDER.empty_string)
}

/**
 * Creates friend request and sets the name of initiator in the actionUserId field
 * @param {Integer} currentUserId 
 * @param {Integer} friendUserId 
 */
exports.createFriendRequest = async (currentUserId, friendUserId) => {
    let createFriendQuery = await Relationships.bulkCreate([
        {
            userOneId: currentUserId,
            userTwoId: friendUserId,
            status: FRIENDSTATUS.pending,
            actionUserId: currentUserId,
        },
        {
            userOneId: friendUserId,
            userTwoId: currentUserId,
            status: FRIENDSTATUS.pending,
            actionUserId: currentUserId,
        },
    ]).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, createFriendQuery, PLACEHOLDER.empty_string)
}

/**
 * Changes friend request status to 
 * accepted -> 1
 * declined -> 2
 * @param {Integer} currentUserId 
 * @param {Integer} friendUserId 
 * @param {Integer} status 
 */
exports.changeRequestStatus = async (currentUserId, friendUserId, status) => {
    let updateStatusQuery = await Relationships.update({
        status: status,
        actionUserId: currentUserId,
    }, {
        where: {
            [Op.or]: [
                {
                    [Op.and]: [
                        { userOneId: currentUserId },
                        { userTwoId: friendUserId },
                    ]
                },
                {
                    [Op.and]: [
                        { userOneId: friendUserId },
                        { userTwoId: currentUserId },
                    ]
                }
            ],
            status: FRIENDSTATUS.pending, // Status pending then only accept/decline
        }
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, updateStatusQuery, PLACEHOLDER.empty_string)
}

/**
 * Get list of friends
 * @param {Integer} userId 
 */
exports.getFriendList = async (userId) => {
    let queryResult = await Relationships.findAll({
        where: {
            [Op.or]: [
                { userOneId: userId, },
                { userTwoId: userId, }
            ]
        }
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, queryResult, PLACEHOLDER.empty_response)
}

/**
 * Get list if users who sent current user a friend request
 * @param {Integer} userId 
 */
exports.friendRequestList = async (userId) => {
    let queryResult = await Relationships.findAll({
        where: {
            [Op.or]: [
                { userTwoId: userId, }
            ],
            status: FRIENDSTATUS.pending,
            actionUserId: {
                [Op.ne] : userId,
            }
        },
        include: {
            attributes: ['name', 'loginid'],
            model: User,
        }
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, queryResult, PLACEHOLDER.empty_response)
}
