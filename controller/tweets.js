const tweets = require('../classes/Tweets/Tweets')
const users = require('../classes/Users/Users')
const text = require('../text')
const errorConstants = require('../errorConstants')
const utils = require('../utils')
const constants = require('../classes/Tweets/Constants')
const functions = require('../classes/Tweets/Functions')
const relationships = require('../classes/Relationships/Relationships')

/**
 * Add new tweet controller
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.addTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl, req.url)

    let loginParam = req.body.loginId || ""
    let tweettext = req.body.tweetText || ""

    loginParam = loginParam.toString()
    tweettext = tweettext.toString()

    if (loginParam.length === 0 || tweettext.length === 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.parameters_missing)
    }

    if (!functions.isEmailValid(loginParam) && !functions.isPhoneValid(loginParam)) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.invalid_email_phoneno)
    }

    let userExistsQuery = await users.findUserByLoginId(loginParam)
    let userExistsQueryStatus = userExistsQuery.success
    let userExistsQueryData = userExistsQuery.data

    if (userExistsQueryData == null || userExistsQueryStatus == false) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.user_doesnot_exist)
    }

    let newTweetQuery = await tweets.addNewTweet(userExistsQueryData.id, userExistsQueryData.name, userExistsQueryData.loginid, tweettext.TEXT)
    let newTweetQueryData = newTweetQuery.data

    return utils.sendResponse(res, true, newTweetQueryData, constants.PLACEHOLDER.empty_string)
}

/**
 * Get tweets controller
 * If user has no friends fetches public tweets
 * else fetches friend's tweets
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.getTweets = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.params.userId || -1
    let pageNo = req.params.pageNo || -1
    let pageSize = constants.PAGESIZE

    userId = Number.parseInt(userId)
    pageNo = Number.parseInt(pageNo)

    if (pageNo <= 0 || userId <= 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.parameters_missing)
    }

    let friendsTweets = await users.getFriendsTweets(userId, pageSize, pageNo)
    let reformatedData = functions.reformatFriendTweetData(friendsTweets.data, userId)

    if (reformatedData.length != 0) {
        return utils.sendResponse(res, true, reformatedData, constants.PLACEHOLDER.empty_string)
    }

    let friendListQuery = await relationships.getFriendList(userId)
    let friendList = functions.getFriendsArray(friendListQuery.data, userId)

    let publicTweets = await users.getPublicTweets(userId, pageSize, pageNo, friendList)
    reformatedData = functions.reformatPublicTweetData(publicTweets.data, userId)

    if (reformatedData == null) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.user_doesnot_exist)
    }

    return utils.sendResponse(res, true, reformatedData, constants.PLACEHOLDER.empty_string)
}

/**
 * Updates an existing tweets text
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.updateTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId || -1
    let tweetId = req.body.id || -1
    let tweettext = req.body.tweettext || ""

    userId = Number.parseInt(userId)
    tweetId = Number.parseInt(tweetId)
    tweettext = tweettext.toString()

    if (userId <= 0 || tweetId <= 0 || tweettext.length === 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.parameters_missing)
    }

    let updateTweetQuery = await tweets.updateExistingTweet(tweetId, userId, tweettext)

    if (updateTweetQuery.data[0] === constants.QUERYFAILED) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.tweet_doesnot_exist)
    }

    return utils.sendResponse(res, true, text.TEXT.tweet_updated, constants.PLACEHOLDER.empty_string)
}

/**
 * Delete an existing tweet
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.deleteTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let tweetId = req.body.id || -1
    tweetId = Number.parseInt(tweetId)

    if (tweetId <= 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.parameters_missing)
    }

    let deleteQuery = await tweets.deleteExistingTweet(tweetId)
    let deleteQueryData = deleteQuery.data

    if (deleteQueryData == 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.tweet_doesnot_exist)
    }

    return utils.sendResponse(res, true, text.TEXT.tweet_deleted, constants.PLACEHOLDER.empty_string)
}

exports.isTweetLiked = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId || -1
    let postId = req.body.postId || -1

    userId = Number.parseInt(userId)
    postId = Number.parseInt(postId)

    if (userId <= 0 || postId <= 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.parameters_missing)
    }

    let isLikedQuery = await tweets.isLiked(userId, postId)

    return utils.sendResponse(res, true, isLikedQuery.data, constants.PLACEHOLDER.empty_string)
}

exports.likeExistingTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId || -1
    let postId = req.body.postId || -1
    let likeType = req.body.likeType || ""

    userId = Number.parseInt(userId)
    postId = Number.parseInt(postId)
    likeType = likeType.toString()

    if (userId <= 0 || postId <= 0 || likeType.length === 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.parameters_missing)
    }

    likeType = constants.LIKETYPES[likeType]

    let isLikedQuery = await tweets.isLiked(userId, postId)
    if (isLikedQuery.data.like == true) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.tweet_already_liked)
    }

    let likeTweetQuery = await tweets.likeTweet(userId, postId, likeType)

    return utils.sendResponse(res, true, likeTweetQuery.data, constants.PLACEHOLDER.empty_string)
}

exports.unLikeExistingTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId || -1
    let postId = req.body.postId || -1

    userId = Number.parseInt(userId)
    postId = Number.parseInt(postId)

    if (userId <= 0 || postId <= 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.parameters_missing)
    }

    let isLikedQuery = await tweets.isLiked(userId, postId)
    if (isLikedQuery.data.like == false) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.tweet_already_unliked)
    }

    let unLikeTweetQuery = await tweets.unLikeTweet(userId, postId)

    return utils.sendResponse(res, true, unLikeTweetQuery.data, constants.PLACEHOLDER.empty_string)
}

/**
 * Gets list of tweets liked by a user
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.userLikeTweetList = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId || -1
    userId = Number.parseInt(userId)

    if (userId <= 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.parameters_missing)
    }

    let tweetList = await tweets.getLikeTweetList(userId)

    if (tweetList.success == false) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.error_data_field)
    }

    return utils.sendResponse(res, true, tweetList.data, constants.PLACEHOLDER.empty_string)
}

/**
 * Gets list of users who liked a tweet
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.tweetLikeUserList = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let postId = req.body.postId || -1
    postId = Number.parseInt(postId)

    if (postId <= 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.parameters_missing)
    }

    let userList = await tweets.getLikeUserList(postId)

    if (userList.success == false) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, errorConstants.ERROR.error_data_field)
    }

    return utils.sendResponse(res, true, userList.data, constants.PLACEHOLDER.empty_string)
}
