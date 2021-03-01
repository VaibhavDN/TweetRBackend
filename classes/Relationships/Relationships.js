const Relationships = require("../../models/Relationships")
const { Op } = require('sequelize')
const { ERROR } = require('../../errorConstants')
const { FRIENDSTATUS } = require("./Constants")

let queryResult = {
    success: false,
    data: {},
}

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
        console.log(ERROR.query_error, err)
        queryResult = {
            success: false,
            data: ERROR.error_data_field
        }
        return queryResult
    })

    queryResult = {
        success: true,
        data: findFriendQuery,
    }
    return utils.jsonSafe(queryResult)
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
        console.log(ERROR.query_error, err)
        queryResult = {
            success: false,
            data: ERROR.error_data_field
        }
        return queryResult
    })

    queryResult = {
        success: true,
        data: createFriendQuery,
    }
    return utils.jsonSafe(queryResult)
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
        console.log(ERROR.query_error, err)
        queryResult = {
            success: false,
            data: ERROR.error_data_field
        }
        return queryResult
    })

    queryResult = {
        success: true,
        data: updateStatusQuery,
    }
    return utils.jsonSafe(queryResult)
}
