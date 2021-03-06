const Relationships = require("../../models/Relationships")
const User = require("../../models/Users")

const Op = require('sequelize').Op
const ERROR = require('../../errorConstants').ERROR
const Constants = require("./Constants")
const utils = require('../../utils')

/**
 * Checks if friend request already exists between two users
 * @param {Integer} currentUserId 
 * @param {Integer} friendUserId 
 */
const checkAlreadyFriends = async (currentUserId, friendUserId) => {
    try {
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
                            { userTwoId: currentUserId },
                        ]
                    }
                ]
            }
        })

        return utils.classResponse(true, findFriendQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Creates friend request and sets the name of initiator in the actionUserId field
 * @param {Integer} currentUserId 
 * @param {Integer} friendUserId 
 */
const createFriendRequest = async (currentUserId, friendUserId) => {
    try {
        let createFriendQuery = await Relationships.bulkCreate([
            {
                userOneId: currentUserId,
                userTwoId: friendUserId,
                status: Constants.FRIENDSTATUS.pending,
                actionUserId: currentUserId,
            },
            {
                userOneId: friendUserId,
                userTwoId: currentUserId,
                status: Constants.FRIENDSTATUS.pending,
                actionUserId: currentUserId,
            },
        ])

        return utils.classResponse(true, createFriendQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Changes friend request status to 
 * accepted -> 1
 * declined -> 2
 * @param {Integer} currentUserId 
 * @param {Integer} friendUserId 
 * @param {Integer} status 
 */
const changeRequestStatus = async (currentUserId, friendUserId, status) => {
    try {
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
                status: Constants.FRIENDSTATUS.pending, // Status pending then only accept/decline
            }
        })

        return utils.classResponse(true, updateStatusQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Get list of friends
 * @param {Integer} userId 
 */
const getFriendList = async (userId) => {
    try {
        let queryResult = await Relationships.findAll({
            where: {
                [Op.or]: [
                    { userOneId: userId, },
                    { userTwoId: userId, }
                ]
            }
        })

        return utils.classResponse(true, queryResult, {})
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Get list if users who sent current user a friend request
 * @param {Integer} userId 
 */
const friendRequestList = async (userId) => {
    try {
        let queryResult = await Relationships.findAll({
            where: {
                [Op.or]: [
                    { userTwoId: userId, }
                ],
                status: Constants.FRIENDSTATUS.pending,
                actionUserId: {
                    [Op.ne]: userId,
                }
            },
            include: {
                attributes: ['name', 'loginid'],
                model: User,
            }
        })

        return utils.classResponse(true, queryResult, {})
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

module.exports = {
    'checkAlreadyFriends': checkAlreadyFriends,
    'createFriendRequest': createFriendRequest,
    'changeRequestStatus': changeRequestStatus,
    'getFriendList': getFriendList,
    'friendRequestList': friendRequestList,
}
