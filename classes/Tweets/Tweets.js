const Op = require("sequelize").Op

const Tweets = require("../../models/Tweets").Tweets
const User = require("../../models/Users")
const Like = require("../../models/Like").Like

const ERROR = require('../../errorConstants').ERROR
const utils = require("../../utils")
const POSTTYPE = require("./Constants").POSTTYPE


/**
 * Checks if the tweet exists in the Tweets model
 * @param {Integer} tweetId 
 */
const findIfTweetExists = async (tweetId) => {
    try {
        let findTweetQuery = await Tweets.findOne({
            where: {
                id: tweetId,
            }
        })

        return utils.classResponse(true, findTweetQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Adds new tweets in the Tweets model
 * @param {Integer} userId 
 * @param {String} name 
 * @param {Integer} loginid 
 * @param {String} tweetText 
 */
const addNewTweet = async (userId, name, loginid, tweetText) => {
    try {
        let addTweetQuery = await Tweets.create({
            userId: userId,
            name: name,
            loginid: loginid,
            tweet: tweetText,
        })

        return utils.classResponse(true, addTweetQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Update an existing tweets text in Tweets model
 * @param {Integer} tweetId 
 * @param {Integer} userId 
 * @param {String} tweetText 
 */
const updateExistingTweet = async (tweetId, userId, tweetText) => {
    try {
        let updateTweetQuery = await Tweets.update({
            tweet: tweetText,
        }, {
            where: {
                [Op.and]: [
                    { id: tweetId },
                    { userId: userId },
                ]
            }
        })

        return utils.classResponse(true, updateTweetQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Delete's a tweet from the Tweets model
 * @param {Integer} tweetId 
 */
const deleteExistingTweet = async (tweetId) => {
    try {
        let removeTweetQuery = await Tweets.destroy({
            where: {
                id: tweetId,
            }
        })

        return utils.classResponse(true, removeTweetQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

const isLiked = async (userId, postId) => {
    try {
        let isLikedQuery = await Like.findOne({
            where: {
                'userId': userId,
                'postId': postId,
                'postType': POSTTYPE.tweet,
            }
        })

        if (isLikedQuery == null) {
            return utils.classResponse(true, { like: false }, "")
        }
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    }

    return utils.classResponse(true, { like: true }, "")
}

const likeTweet = async (userId, postId, likeType) => {
    try {
        let likeTweetQuery = await Like.create({
            'userId': userId,
            'postId': postId,
            'likeType': likeType,
            'postType': POSTTYPE.tweet,
        })

        return utils.classResponse(true, likeTweetQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    }
}

const unLikeTweet = async (userId, postId) => {
    try {
        let unLikeTweetQuery = await Like.destroy({
            where: {
                'userId': userId,
                'postId': postId,
                'postType': POSTTYPE.tweet,
            }
        })

        return utils.classResponse(true, unLikeTweetQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    }
}

/**
 * Get list of users who like a tweet
 * @param {Integer} tweetId 
 */
const getLikeUserList = async (postId) => {
    try {
        let userListQuery = await Like.findAll({
            where: {
                'postId': postId,
                'postType': POSTTYPE.tweet,
            },
            include: {
                attributes: ['id', 'name', 'loginid'],
                model: User,
            },
        })

        return utils.classResponse(true, userListQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    }
}

/**
 * Get list of tweets liked by a user
 * @param {Integer} userId 
 */
const getLikeTweetList = async (userId) => {
    try {
        let tweetListQuery = await Like.findAll({
            where: {
                userId: userId,
                'postType': POSTTYPE.tweet,
            },
            include: {
                model: Tweets,
            },
        })

        return utils.classResponse(true, tweetListQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    }
}

module.exports = {
    findIfTweetExists,
    addNewTweet,
    updateExistingTweet,
    deleteExistingTweet,
    isLiked,
    likeTweet,
    unLikeTweet,
    getLikeUserList,
    getLikeTweetList,
}
