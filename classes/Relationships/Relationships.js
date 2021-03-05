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
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.query_error)
    })

    return utils.classResponse(true, findFriendQuery, "")
}

/**
 * Creates friend request and sets the name of initiator in the actionUserId field
 * @param {Integer} currentUserId 
 * @param {Integer} friendUserId 
 */
const createFriendRequest = async (currentUserId, friendUserId) => {
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
    ]).catch((err) => {
        return utils.classResponse(false, {}, ERROR.query_error)
    })

    return utils.classResponse(true, createFriendQuery, "")
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
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.query_error)
    })

    return utils.classResponse(true, updateStatusQuery, "")
}

/**
 * Get list of friends
 * @param {Integer} userId 
 */
const getFriendList = async (userId) => {
    let queryResult = await Relationships.findAll({
        where: {
            [Op.or]: [
                { userOneId: userId, },
                { userTwoId: userId, }
            ]
        }
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.query_error)
    })

    return utils.classResponse(true, queryResult, {})
}

/**
 * Get list if users who sent current user a friend request
 * @param {Integer} userId 
 */
const friendRequestList = async (userId) => {
    let queryResult = await Relationships.findAll({
        where: {
            [Op.or]: [
                { userTwoId: userId, }
            ],
            status: Constants.FRIENDSTATUS.pending,
            actionUserId: {
                [Op.ne] : userId,
            }
        },
        include: {
            attributes: ['name', 'loginid'],
            model: User,
        }
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.query_error)
    })

    return utils.classResponse(true, queryResult, {})
}

module.exports = {
    'checkAlreadyFriends': checkAlreadyFriends,
    'createFriendRequest': createFriendRequest,
    'changeRequestStatus': changeRequestStatus,
    'getFriendList': getFriendList,
    'friendRequestList': friendRequestList,
}
