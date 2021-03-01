const Relationships = require('../../models/Relationships')
const User = require('../../models/Users')
const { Tweets, TweetLike } = require('../../models/Tweets')
const { Op } = require('sequelize')
const { ERROR } = require('../../errorConstants')
const utils = require('../../utils')

let queryResult = {
    success: false,
    data: {},
}

/**
 * Creates new user in the User model
 * @param {String} name 
 * @param {String} loginid 
 * @param {String} password 
 */
exports.createNewUser = async (name, loginid, password) => {
    let createQueryResponse = await User.create({
        name: name,
        loginid: loginid,
        password: password,
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
        data: createQueryResponse.dataValues,
    }
    return utils.jsonSafe(queryResult)
}

/**
 * Checks if the user exists in the Users model
 * @param {Integer} userId User's id found in the Users model
 */
exports.findIfUserExists = async (userId) => {
    let findQueryResponse = await User.findOne({
        where: {
            id: userId,
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
        data: findQueryResponse.dataValues,
    }
    return utils.jsonSafe(queryResult)
}

/**
 * Find user through loginid field
 * @param {Integer} loginId 
 */
exports.findUserByLoginId = async (loginId) => {
    let findQueryResponse = await User.findOne({
        where: {
            loginid: loginId,
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
        data: findQueryResponse,
    }
    return utils.jsonSafe(queryResult)
}

/**
 * Fetches the tweets of all the friends of a particular user
 * Also implements pagination
 * @param {Integer} userId 
 * @param {Integer} pageSize 
 * @param {Integer} pageNo 
 */
exports.getFriendsTweets = async (userId, pageSize, pageNo) => {
    let friendsTweetsQuery = await User.findAll({
        attributes: ['name', 'loginid'],
        where: {
            id: {
                [Op.ne]: userId,
            }
        },
        include: [
            {
                model: Tweets,
                limit: pageSize,
                offset: ((pageNo - 1) * pageSize),
                order: [['updatedAt', 'DESC']],
                include: {
                    model: TweetLike,
                    order: [['updatedAt', 'DESC']],
                }
            },
            {
                model: Relationships,
                where: {
                    [Op.or]: [
                        { userOneId: userId },
                        { userTwoId: userId }, //Todo: Remove
                    ]
                }
            },
        ],
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
        data: friendsTweetsQuery,
    }
    return utils.jsonSafe(queryResult)
}

/**
 * Fetches all the tweets by date in DESC order
 * @param {Integer} userId 
 * @param {Integer} pageSize 
 * @param {Integer} pageNo 
 */
exports.getPublicTweets = async (userId, pageSize, pageNo) => {
    let publicTweetsQuery = await Tweets.findAll({
        limit: pageSize,
        offset: ((pageNo - 1) * pageSize),
        where: {
            userId: {
                [Op.ne]: userId,
            }
        },
        include: TweetLike,
        order: [['updatedAt', 'DESC']],
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        response = JSON.stringify({
            "success": false,
            "data": ERROR.error_data_field,
        })
        res.send(response)
        return
    })

    queryResult = {
        success: true,
        data: publicTweetsQuery,
    }
    return utils.jsonSafe(queryResult)
}

/**
 * Update user's name
 * @param {String} newName 
 * @param {String} loginParam 
 */
exports.updateUserName = async (newName, loginParam) => {
    updateQueryResponse = await User.update({
        name: newName,
    },
        {
            where: {
                loginid: loginParam,
            },
        }).catch((err) => {
            console.log(ERROR.query_error, err)
            response = JSON.stringify({
                "success": false,
                "data": ERROR.error_data_field,
            })
            res.send(response)
            return
        })

    queryResult = {
        success: true,
        data: updateQueryResponse,
    }
    return utils.jsonSafe(queryResult)
}

/**
 * Update user's password
 * @param {String} password 
 * @param {String} loginParam 
 */
exports.updateUserPassword = async (password, loginParam) => {
    updateQueryResponse = await User.update({
        password: password,
    },
        {
            where: {
                loginid: loginParam,
            },
        }).catch((err) => {
            console.log(ERROR.query_error, err)
            response = JSON.stringify({
                "success": false,
                "data": ERROR.error_data_field,
            })
            res.send(response)
            return
        })

    queryResult = {
        success: true,
        data: updateQueryResponse,
    }
    return utils.jsonSafe(queryResult)
}

/**
 * Searches friends based on their name or loginId (Email/Phone)
 * @param {String} searchText 
 * @param {Integer} currentUserId 
 */
exports.searchFriends = async (searchText, currentUserId) => {
    let searchUserQuery = await User.findAll({
        attributes: ['id', 'name', 'loginid', 'updatedAt'],
        where: {
            [Op.or]: [
                {
                    name: {
                        [Op.like]: "%" + searchText + "%",
                    }
                },
                { loginid: searchText },
            ],
            id: {
                [Op.ne]: currentUserId,
            }
        },
        include: {
            model: Relationships,
            where: {
                [Op.or]: [
                    { userOneId: currentUserId },
                    { userTwoId: currentUserId },
                ]
            },
            order: [['updatedAt', 'DESC']],
        },
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        response = JSON.stringify({
            "success": false,
            "data": ERROR.error_data_field,
        })
        res.send(response)
        return
    })

    queryResult = {
        success: true,
        data: searchUserQuery,
    }
    return utils.jsonSafe(queryResult)
}

/**
 * Search all users based on their name or loginId (Email/Phone)
 * @param {String} searchText 
 * @param {Integer} currentUserId 
 */
exports.searchUnknowns = async (searchText, currentUserId) => {
    let searchUnknownUserQuery = await User.findAll({
        attributes: ['id', 'name', 'loginid', 'updatedAt'],
        where: {
            [Op.or]: [
                {
                    name: {
                        [Op.like]: "%" + searchText + "%",
                    }
                },
                { loginid: searchText },
            ],
            id: {
                [Op.ne]: currentUserId,
            }
        },
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        response = JSON.stringify({
            "success": false,
            "data": ERROR.error_data_field,
        })
        res.send(response)
        return
    })

    queryResult = {
        success: true,
        data: searchUnknownUserQuery,
    }
    return utils.jsonSafe(queryResult)
}
