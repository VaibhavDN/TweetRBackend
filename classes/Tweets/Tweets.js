const { Op } = require("sequelize")
const { Tweets } = require("../../models/Tweets")
const { ERROR } = require('../../errorConstants')
const utils = require("../../utils")
const { PLACEHOLDER, POSTTYPE } = require("./Constants")
const User = require("../../models/Users")
const { Like } = require("../../models/Like")

/**
 * Checks if the tweet exists in the Tweets model
 * @param {Integer} tweetId 
 */
exports.findIfTweetExists = async (tweetId) => {
    let findTweetQuery = await Tweets.findOne({
        where: {
            id: tweetId,
        }
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, findTweetQuery, PLACEHOLDER.empty_string)
}

/**
 * Adds new tweets in the Tweets model
 * @param {Integer} userId 
 * @param {String} name 
 * @param {Integer} loginid 
 * @param {String} tweetText 
 */
exports.addNewTweet = async (userId, name, loginid, tweetText) => {
    let addTweetQuery = await Tweets.create({
        userId: userId,
        name: name,
        loginid: loginid,
        tweet: tweetText,
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, addTweetQuery, PLACEHOLDER.empty_string)
}

/**
 * Update an existing tweets text in Tweets model
 * @param {Integer} tweetId 
 * @param {Integer} userId 
 * @param {String} tweetText 
 */
exports.updateExistingTweet = async (tweetId, userId, tweetText) => {
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
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, updateTweetQuery, PLACEHOLDER.empty_string)
}

/**
 * Delete's a tweet from the Tweets model
 * @param {Integer} tweetId 
 */
exports.deleteExistingTweet = async (tweetId) => {
    let removeTweetQuery = await Tweets.destroy({
        where: {
            id: tweetId,
        }
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.query_error)
    })

    return utils.classResponse(true, removeTweetQuery, PLACEHOLDER.empty_string)
}

exports.isLiked = async (userId, postId) => {
    let isLikedQuery = await Like.findOne({
        where: {
            'userId': userId,
            'postId': postId,
            'postType': POSTTYPE.tweet,
        }
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    if (isLikedQuery == null) {
        return utils.classResponse(true, { like: false }, PLACEHOLDER.empty_string)
    }

    return utils.classResponse(true, { like: true }, PLACEHOLDER.empty_string)
}

exports.likeTweet = async (userId, postId, likeType) => {
    let likeTweetQuery = await Like.create({
        'userId': userId,
        'postId': postId,
        'likeType': likeType,
        'postType': POSTTYPE.tweet,
    }).catch((err) => {
        console.log(err)
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, likeTweetQuery, PLACEHOLDER.empty_string)
}

exports.unLikeTweet = async (userId, postId) => {
    let unLikeTweetQuery = await Like.destroy({
        where: {
            'userId': userId,
            'postId': postId,
            'postType': POSTTYPE.tweet,
        }
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, unLikeTweetQuery, PLACEHOLDER.empty_string)
}

/**
 * Get list of users who like a tweet
 * @param {Integer} tweetId 
 */
exports.getLikeUserList = async (postId) => {
    let userListQuery = await Like.findAll({
        where: {
            'postId': postId,
            'postType': POSTTYPE.tweet,
        },
        include: {
            attributes: ['id', 'name', 'loginid'],
            model: User,
        },
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, userListQuery, PLACEHOLDER.empty_string)
}

/**
 * Get list of tweets liked by a user
 * @param {Integer} userId 
 */
exports.getLikeTweetList = async (userId) => {
    let tweetListQuery = await Like.findAll({
        where: {
            userId: userId,
            'postType': POSTTYPE.tweet,
        },
        include: {
            model: Tweets,
        },
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, tweetListQuery, PLACEHOLDER.empty_string)
}
