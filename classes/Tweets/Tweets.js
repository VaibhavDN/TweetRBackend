const { Op } = require("sequelize")
const { Tweets, TweetLike } = require("../../models/Tweets")
const { ERROR } = require('../../errorConstants')
const utils = require("../../utils")
const { PLACEHOLDER } = require("./Constants")
const User = require("../../models/Users")

let queryResult = {
    success: false,
    data: {},
}

/**
 * Checks if the tweet exists in the Tweets model
 * @param {Integer} tweetId 
 */
exports.findIfTweetExists = async (tweetId) => {
    let findTweetQuery = await Tweets.findOne({
        where: {
            id: tweetId,
        }
    })
        .catch((err) => {
            console.log(ERROR.query_error, err)
            queryResult = {
                success: false,
                data: ERROR.error_data_field
            }
            return queryResult
        })

    queryResult = {
        success: true,
        data: findTweetQuery,
    }
    return utils.jsonSafe(queryResult)
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
        console.log(ERROR.query_error, err)
        queryResult = {
            success: false,
            data: ERROR.error_data_field
        }
        return queryResult
    })

    queryResult = {
        success: true,
        data: addTweetQuery,
    }
    return utils.jsonSafe(queryResult)
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
        console.log(ERROR.query_error, err)
        queryResult = {
            success: false,
            data: ERROR.error_data_field
        }
        return queryResult
    })

    queryResult = {
        success: true,
        data: updateTweetQuery,
    }
    return utils.jsonSafe(queryResult)
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
        console.log(ERROR.query_error, err)
        queryResult = {
            success: false,
            data: ERROR.error_data_field
        }
        return queryResult
    })

    queryResult = {
        success: true,
        data: removeTweetQuery,
    }
    return utils.jsonSafe(queryResult)
}

exports.isLiked = async (userId, tweetId) => {
    console.log(userId, tweetId)
    let isLikedQuery = await TweetLike.findOne({
        where: {
            'userId': userId,
            'tweetId': tweetId,
        }
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    if(isLikedQuery == null) {
        return utils.classResponse(true, {like: false}, PLACEHOLDER.empty_string)
    }

    return utils.classResponse(true, {like: true}, PLACEHOLDER.empty_string)
}

exports.likeTweet = async (userId, tweetId) => {
    let likeTweetQuery = await TweetLike.create({
        userId: userId,
        tweetId: tweetId,
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, likeTweetQuery, PLACEHOLDER.empty_string)
}

exports.unLikeTweet = async (userId, tweetId) => {
    let unLikeTweetQuery = await TweetLike.destroy({
        where: {
            userId: userId,
            tweetId: tweetId,
        }
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, unLikeTweetQuery, PLACEHOLDER.empty_string)
}

/**
 * Get list of users who like a tweet
 * @param {Integer} tweetId 
 */
exports.getLikeUserList = async (tweetId) => {
    let userListQuery = await TweetLike.findAll({
        where: {
            tweetId: tweetId,
        },
        include: {
            attributes: ['id', 'name', 'loginid'],
            model: User,
        },
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, userListQuery, PLACEHOLDER.empty_string)
}

/**
 * Get list of tweets liked by a user
 * @param {Integer} userId 
 */
exports.getLikeTweetList = async (userId) => {
    let tweetListQuery = await TweetLike.findAll({
        where: {
            userId: userId,
        },
        include: {
            model: Tweets,
        },
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, tweetListQuery, PLACEHOLDER.empty_string)
}
