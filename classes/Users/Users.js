const Relationships = require('../../models/Relationships')
const User = require('../../models/Users')
const Tweets = require('../../models/Tweets').Tweets
const Like = require('../../models/Like').Like

const Op = require('sequelize').Op
const ERROR = require('../../errorConstants').ERROR
const utils = require('../../utils')
const POSTTYPE = require('../Users/Constants').POSTTYPE

/**
 * Creates new user in the User model
 * @param {String} name 
 * @param {String} loginid 
 * @param {String} password 
 */
exports.createNewUser = async (name, loginid, password) => {
    try {
        let createQueryResponse = await User.create({
            name: name,
            loginid: loginid,
            password: password,
        })

        return utils.classResponse(true, createQueryResponse, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Checks if the user exists in the Users model
 * @param {Integer} userId User's id found in the Users model
 */
exports.findIfUserExists = async (userId) => {
    try {
        let findQueryResponse = await User.findOne({
            where: {
                id: userId,
            }
        })

        return utils.classResponse(true, findQueryResponse, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Find user through loginid field
 * @param {Integer} loginId 
 */
exports.findUserByLoginId = async (loginId) => {
    try {
        let findQueryResponse = await User.findOne({
            where: {
                loginid: loginId,
            }
        })

        return utils.classResponse(true, findQueryResponse, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Fetches the tweets of all the friends of a particular user
 * Also implements pagination
 * @param {Integer} userId 
 * @param {Integer} pageSize 
 * @param {Integer} pageNo 
 */
exports.getFriendsTweets = async (userId, pageSize, pageNo) => {
    try {
        let friendsTweetsQuery = await User.findAll({
            attributes: ['name', 'loginid'],
            limit: pageSize,
            offset: ((pageNo - 1) * pageSize),
            where: {
                id: {
                    [Op.ne]: userId
                },
            },
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
        })

        return utils.classResponse(true, friendsTweetsQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Fetches tweets from users who are not friends by date in DESC order
 * @param {Integer} userId 
 * @param {Integer} pageSize 
 * @param {Integer} pageNo 
 * @param {Array} friendList
 */
exports.getPublicTweets = async (userId, pageSize, pageNo, friendList) => {
    try {
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
        })

        return utils.classResponse(true, publicTweetsQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Update user's name
 * @param {String} newName 
 * @param {String} loginParam 
 */
exports.updateUserName = async (newName, loginParam) => {
    try {
        let updateQueryResponse = await User.update(
            {
                name: newName,
            },
            {
                where: {
                    loginid: loginParam,
                },
            }
        )

        return utils.classResponse(true, updateQueryResponse, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Update user's password
 * @param {String} password 
 * @param {String} loginParam 
 */
exports.updateUserPassword = async (password, loginParam) => {
    try {
        let updateQueryResponse = await User.update(
            {
                password: password,
            },
            {
                where: {
                    loginid: loginParam,
                },
            }
        )

        return utils.classResponse(true, updateQueryResponse, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Searches friends based on their name or loginId (Email/Phone)
 * @param {String} searchText 
 * @param {Integer} currentUserId 
 */
exports.searchFriends = async (searchText, currentUserId) => {
    try {
        let searchUserQuery = await User.findAll({
            attributes: ['id', 'name', 'loginid', 'updatedAt'],
            where: {
                [Op.or]: [
                    {
                        name: {
                            [Op.iLike]: "%" + searchText + "%",
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
        })

        return utils.classResponse(true, searchUserQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Search all users based on their name or loginId (Email/Phone)
 * @param {String} searchText 
 * @param {Integer} currentUserId 
 */
exports.searchUnknowns = async (searchText, currentUserId) => {
    try {
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
        })

        return utils.classResponse(true, searchUnknownUserQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}
