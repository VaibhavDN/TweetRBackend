const utils = require('../utils')

const Tweets = require('../classes/Tweets/Tweets')
const Users = require('../classes/Users/Users')
const Relationships = require('../classes/Relationships/Relationships')
const Like = require('../classes/Likes/Likes')
const Functions = require('../classes/Tweets/Functions')
const Constants = require('../classes/Tweets/Constants')

const text = require('../text').TEXT
const ERROR = require('../errorConstants').ERROR

/**
 * Add new tweet controller
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.addTweet = async (req, res, next) => {
    let userId = parseInt(req.userId)
    let tweettext = req.body.tweetText || ""

    if (utils.checkIsNaN(userId) || tweettext.length === 0) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    let userExistsQuery = await Users.findIfUserExists(userId)
    let userExistsData = userExistsQuery.data

    if(userExistsQuery.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (userExistsData === null) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    let newTweetQuery = await Tweets.addNewTweet(userExistsData.id, userExistsData.name, userExistsData.loginid, tweettext) 

    return utils.sendResponse(res, true, newTweetQuery.data, "")
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
    let userId = parseInt(req.userId)
    let pageNo = parseInt(req.query.page) || 1
    let pageSize = Constants.PAGESIZE

    if (utils.checkIsNaN(pageNo, userId)) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if(!await Functions.validateUser(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    let friendListQuery = await Relationships.getFriendList(userId)

    if(friendListQuery.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    let friendList = Functions.getFriendsArray(friendListQuery.data, userId)
    
    let friendsTweets = await Users.getFriendsTweets(pageSize, pageNo, friendList)

    if(friendsTweets.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    let reformatedData = Functions.reformatTweetData(friendsTweets.data, userId, Constants.TWEETTYPE.friend)
    
    if (reformatedData.length != 0) {
        return utils.sendResponse(res, true, reformatedData, "")
    }

    let publicTweets = await Users.getPublicTweets(pageSize, pageNo, friendList)

    if(publicTweets.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    reformatedData = Functions.reformatTweetData(publicTweets.data, userId, Constants.TWEETTYPE.public)

    if (reformatedData == null) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    return utils.sendResponse(res, true, reformatedData, "")
}

/**
 * Updates an existing tweets text
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.updateTweet = async (req, res, next) => {
    let body = req.body
    let userId = parseInt(req.userId)
    let tweetId = parseInt(body.tweetId)
    let tweettext = body.tweettext || ""

    if (utils.checkIsNaN(userId, tweetId) || tweettext.length === 0) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if(!await Functions.validateUser(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    let updateTweet = await Tweets.updateExistingTweet(tweetId, userId, tweettext)
    let updateTweetData = updateTweet.data

    if(updateTweet.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (updateTweetData[0] === Constants.QUERYFAILED) {
        return utils.sendResponse(res, false, {}, ERROR.tweet_doesnot_exist)
    }

    return utils.sendResponse(res, true, text.tweet_updated, "")
}

/**
 * Delete an existing tweet
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.deleteTweet = async (req, res, next) => {
    let tweetId = parseInt(req.body.tweetId)

    if (utils.checkIsNaN(tweetId)) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    let queryResult = await Tweets.deleteExistingTweet(tweetId)
    let data = queryResult.data

    if(queryResult.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (data === Constants.QUERYFAILED) {
        return utils.sendResponse(res, false, {}, ERROR.tweet_doesnot_exist)
    }

    return utils.sendResponse(res, true, text.tweet_deleted, "")
}

/**
 * Checks if the tweet has already been liked
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.isTweetLiked = async (req, res, next) => {
    let userId = parseInt(req.userId)
    let postId = parseInt(req.body.postId)

    if (utils.checkIsNaN(userId, postId)) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if(!await Functions.validateUser(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    let queryResult = await Like.isTweetLiked(userId, postId)
    let data = queryResult.data

    if(queryResult.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    return utils.sendResponse(res, true, data, "")
}

/**
 * Likes a tweet
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.likeExistingTweet = async (req, res, next) => {
    let body = req.body
    let userId = parseInt(req.userId)
    let postId = parseInt(body.postId)
    let likeType = body.likeType || ""

    if (utils.checkIsNaN(userId, postId) || likeType.length === 0) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if(!await Functions.validateUser(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    likeType = Constants.LIKETYPES[likeType]

    let alreadyLikedQuery = await Like.isTweetLiked(userId, postId)
    let alreadyLiked = alreadyLikedQuery.data.like

    if(alreadyLikedQuery.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (alreadyLiked === true) {
        return utils.sendResponse(res, false, {}, ERROR.tweet_already_liked)
    }

    let likeTweetData = (await Like.likeTweet(userId, postId, likeType)).data

    return utils.sendResponse(res, true, likeTweetData, "")
}

/**
 * Unlikes a tweet
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.unLikeExistingTweet = async (req, res, next) => {
    let userId = parseInt(req.userId)
    let postId = parseInt(req.body.postId)

    if (utils.checkIsNaN(userId, postId)) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if(!await Functions.validateUser(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    let likedQuery = await Like.isTweetLiked(userId, postId)
    let liked = likedQuery.data.like

    if(likedQuery.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (liked === false) {
        return utils.sendResponse(res, false, {}, ERROR.tweet_already_unliked)
    }

    let unLikeTweetData = (await Like.unLikeTweet(userId, postId)).data

    return utils.sendResponse(res, true, unLikeTweetData, "")
}

/**
 * Gets list of tweets liked by a user
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.userLikeTweetList = async (req, res, next) => {
    let userId = parseInt(req.userId)

    if (utils.checkIsNaN(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if(!await Functions.validateUser(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    let tweetList = await Like.getLikeTweetList(userId)

    if (tweetList.success == false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    return utils.sendResponse(res, true, tweetList.data, "")
}

/**
 * Gets list of users who liked a tweet
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.tweetLikeUserList = async (req, res, next) => {
    let postId = parseInt(req.body.postId)

    if (utils.checkIsNaN(postId)) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    let userList = await Like.getTweetLikeUserList(postId)

    if (userList.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    return utils.sendResponse(res, true, userList.data, "")
}
