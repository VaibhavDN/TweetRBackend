const Tweets = require("../../models/Tweets").Tweets
const User = require("../../models/Users")
const Like = require("../../models/Like").Like

const ERROR = require('../../errorConstants').ERROR
const utils = require("../../utils")
const Constants = require("./Constants")
const Op = require("sequelize").Op


/**
 * Checks if the tweet exists in the Tweets model
 * @param {Integer} tweetId 
 */
const findIfTweetExists = async (tweetId) => {
    let findTweetQuery = await Tweets.findOne({
        where: {
            id: tweetId,
        }
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.query_error)
    })

    return utils.classResponse(true, findTweetQuery, "")
}

/**
 * Adds new tweets in the Tweets model
 * @param {Integer} userId 
 * @param {String} name 
 * @param {Integer} loginid 
 * @param {String} tweetText 
 */
const addNewTweet = async (userId, name, loginid, tweetText) => {
    let addTweetQuery = await Tweets.create({
        userId: userId,
        name: name,
        loginid: loginid,
        tweet: tweetText,
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.query_error)
    })

    return utils.classResponse(true, addTweetQuery, "")
}

/**
 * Update an existing tweets text in Tweets model
 * @param {Integer} tweetId 
 * @param {Integer} userId 
 * @param {String} tweetText 
 */
const updateExistingTweet = async (tweetId, userId, tweetText) => {
    let updateTweetQuery = await Tweets.update({
        tweet: tweetText,
    }, {
        where: {
            [Op.and]: [
                { id: tweetId },
                { userId: userId },
            ]
        }
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.query_error)
    })

    return utils.classResponse(true, updateTweetQuery, "")
}

/**
 * Delete's a tweet from the Tweets model
 * @param {Integer} tweetId 
 */
const deleteExistingTweet = async (tweetId) => {
    let removeTweetQuery = await Tweets.destroy({
        where: {
            id: tweetId,
        }
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.query_error)
    })

    return utils.classResponse(true, removeTweetQuery, "")
}

const isLiked = async (userId, postId) => {
    let isLikedQuery = await Like.findOne({
        where: {
            'userId': userId,
            'postId': postId,
            'postType': Constants.POSTTYPE.tweet,
        }
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    })

    if (isLikedQuery == null) {
        return utils.classResponse(true, { like: false }, "")
    }

    return utils.classResponse(true, { like: true }, "")
}

const likeTweet = async (userId, postId, likeType) => {
    let likeTweetQuery = await Like.create({
        'userId': userId,
        'postId': postId,
        'likeType': likeType,
        'postType': Constants.POSTTYPE.tweet,
    }).catch((err) => {
        console.log(err)
        return utils.classResponse(false, {}, ERROR.error_data_field)
    })

    return utils.classResponse(true, likeTweetQuery, "")
}

const unLikeTweet = async (userId, postId) => {
    let unLikeTweetQuery = await Like.destroy({
        where: {
            'userId': userId,
            'postId': postId,
            'postType': Constants.POSTTYPE.tweet,
        }
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    })

    return utils.classResponse(true, unLikeTweetQuery, "")
}

/**
 * Get list of users who like a tweet
 * @param {Integer} tweetId 
 */
const getLikeUserList = async (postId) => {
    let userListQuery = await Like.findAll({
        where: {
            'postId': postId,
            'postType': Constants.POSTTYPE.tweet,
        },
        include: {
            attributes: ['id', 'name', 'loginid'],
            model: User,
        },
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    })

    return utils.classResponse(true, userListQuery, "")
}

/**
 * Get list of tweets liked by a user
 * @param {Integer} userId 
 */
const getLikeTweetList = async (userId) => {
    let tweetListQuery = await Like.findAll({
        where: {
            userId: userId,
            'postType': Constants.POSTTYPE.tweet,
        },
        include: {
            model: Tweets,
        },
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    })

    return utils.classResponse(true, tweetListQuery, "")
}

module.exports = {
    'findIfTweetExists': findIfTweetExists,
    'addNewTweet': addNewTweet,
    'updateExistingTweet': updateExistingTweet,
    'deleteExistingTweet': deleteExistingTweet,
    'isLiked': isLiked,
    'likeTweet': likeTweet,
    'unLikeTweet': unLikeTweet,
    'getLikeUserList': getLikeUserList,
    'getLikeTweetList': getLikeTweetList,
}
