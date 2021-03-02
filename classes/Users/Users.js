const Relationships = require('../../models/Relationships')
const User = require('../../models/Users')
const { Tweets } = require('../../models/Tweets')
const { Op } = require('sequelize')
const { ERROR } = require('../../errorConstants')
const utils = require('../../utils')
const { Like } = require('../../models/Like')
const { POSTTYPE, PLACEHOLDER } = require('../Users/Constants')

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
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, createQueryResponse, PLACEHOLDER.empty_string)
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
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, findQueryResponse, PLACEHOLDER.empty_string)
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
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, findQueryResponse, PLACEHOLDER.empty_string)
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
        include: [
            {
                model: Tweets,
                limit: pageSize,
                offset: ((pageNo - 1) * pageSize),
                order: [['updatedAt', 'DESC']],
                include: {
                    model: Like,
                    where: {
                        "postType": POSTTYPE.tweet,
                    },
                    required: false,
                    order: [['updatedAt', 'DESC']],
                }
            },
            {
                model: Relationships,
                where: {
                    [Op.or]: [
                        { userOneId: userId },
                        { userTwoId: userId },
                    ]
                }
            },
        ],
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, friendsTweetsQuery, PLACEHOLDER.empty_string)
}

/**
 * Fetches tweets from users who are not friends by date in DESC order
 * @param {Integer} userId 
 * @param {Integer} pageSize 
 * @param {Integer} pageNo 
 * @param {Array} friendList
 */
exports.getPublicTweets = async (userId, pageSize, pageNo, friendList) => {
    let publicTweetsQuery = await Tweets.findAll({
        limit: pageSize,
        offset: ((pageNo - 1) * pageSize),
        where: {
            userId: {
                [Op.notIn]: friendList
            }
        },
        include: [
            {
                model: Like,
                where: {
                    postType: POSTTYPE.tweet,
                },
                required: false,
            },
        ],
        order: [['updatedAt', 'DESC']],
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, publicTweetsQuery, PLACEHOLDER.empty_string)
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
            return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
        })

    return utils.classResponse(true, updateQueryResponse, PLACEHOLDER.empty_string)
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
            return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
        })

    return utils.classResponse(true, updateQueryResponse, PLACEHOLDER.empty_string)
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
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, searchUserQuery, PLACEHOLDER.empty_string)
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
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, searchUnknownUserQuery, PLACEHOLDER.empty_string)
}
