const { findUserByLoginId } = require('../classes/Users/Users')
const { addNewTweet, updateExistingTweet, deleteExistingTweet, isLiked, likeTweet, unLikeTweet, getLikeUserList, getLikeTweetList } = require('../classes/Tweets/Tweets')
const { getFriendsTweets, getPublicTweets } = require('../classes/Users/Users')
const { TEXT } = require('../text')
const { ERROR } = require('../errorConstants')
const utils = require('../utils')
const { PLACEHOLDER, PAGESIZE, QUERYFAILED } = require('../classes/Tweets/Constants')
const { isEmailValid, isPhoneValid, reformatFriendTweetData, reformatPublicTweetData, getFriendsArray } = require('../classes/Tweets/Functions')
const { getFriendList } = require('../classes/Relationships/Relationships')

/**
 * Add new tweet controller
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.addTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl, req.url)

    let loginParam = req.body.loginId
    let tweetText = req.body.tweetText

    if (!loginParam || !tweetText) {
        res.send(utils.sendResponse(false, {}, ERROR.parameters_missing))
        return
    }

    if (!isEmailValid(loginParam) && !isPhoneValid(loginParam)) {
        res.send(utils.sendResponse(false, {}, ERROR.invalid_email_phoneno))
        return
    }

    let userExistsQuery = await findUserByLoginId(loginParam)
    let userExistsQueryStatus = userExistsQuery.success
    let userExistsQueryData = userExistsQuery.data

    if (userExistsQueryData == null || userExistsQueryStatus == false) {
        res.send(utils.sendResponse(false, {}, ERROR.user_doesnot_exist))
        return
    }

    let newTweetQuery = await addNewTweet(userExistsQueryData.id, userExistsQueryData.name, userExistsQueryData.loginid, tweetText)
    let newTweetQueryData = newTweetQuery.data

    res.send(utils.sendResponse(true, newTweetQueryData, PLACEHOLDER.empty_string))
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
    let pageSize = PAGESIZE

    userId = Number.parseInt(userId)
    pageNo = Number.parseInt(pageNo)

    if (pageNo <= 0 || userId <= 0) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let friendsTweets = await getFriendsTweets(userId, pageSize, pageNo)
    let reformatedData = reformatFriendTweetData(friendsTweets.data, userId)

    if (reformatedData.length != 0) {
        res.send(utils.sendResponse(true, reformatedData, PLACEHOLDER.empty_string))
        return
    }

    let friendListQuery = await getFriendList(userId)
    let friendList = getFriendsArray(friendListQuery.data, userId)

    let publicTweets = await getPublicTweets(userId, pageSize, pageNo, friendList)
    reformatedData = reformatPublicTweetData(publicTweets.data, userId)

    if (reformatedData == null) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.user_doesnot_exist))
        return
    }

    res.send(utils.sendResponse(true, reformatedData, PLACEHOLDER.empty_string))
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
    let tweetText = req.body.tweetText || ""

    userId = Number.parseInt(userId)
    tweetId = Number.parseInt(tweetId)
    tweetText = tweetText.toString()

    if (userId <= 0 || tweetId <= 0 || tweetText.length === 0) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let updateTweetQuery = await updateExistingTweet(tweetId, userId, tweetText)

    if (updateTweetQuery.data[0] === QUERYFAILED) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.tweet_doesnot_exist))
        return
    }

    res.send(utils.sendResponse(true, TEXT.tweet_updated, PLACEHOLDER.empty_string))
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
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let deleteQuery = await deleteExistingTweet(tweetId)
    let deleteQueryData = deleteQuery.data

    if (deleteQueryData == 0) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.tweet_doesnot_exist))
        return
    }

    res.send(utils.sendResponse(true, TEXT.tweet_deleted, PLACEHOLDER.empty_string))
}

exports.isTweetLiked = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId || -1
    let postId = req.body.postId || -1

    userId = Number.parseInt(userId)
    postId = Number.parseInt(postId)

    if (userId <= 0 || postId <= 0) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let isLikedQuery = await isLiked(userId, postId)

    res.send(utils.sendResponse(true, isLikedQuery.data, PLACEHOLDER.empty_string))
}

exports.likeExistingTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId || -1
    let postId = req.body.postId || -1
    let likeType = req.body.likeType || -1

    userId = Number.parseInt(userId)
    postId = Number.parseInt(postId)
    likeType = Number.parseInt(likeType)

    if (userId <= 0 || postId <= 0 || likeType <= 0) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let isLikedQuery = await isLiked(userId, postId)
    if (isLikedQuery.data.like == true) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.tweet_already_liked))
        return
    }

    let likeTweetQuery = await likeTweet(userId, postId, likeType)

    res.send(utils.sendResponse(true, likeTweetQuery.data, PLACEHOLDER.empty_string))
}

exports.unLikeExistingTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId || -1
    let postId = req.body.postId || -1

    userId = Number.parseInt(userId)
    postId = Number.parseInt(postId)

    if (userId <= 0 || postId <= 0) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let isLikedQuery = await isLiked(userId, postId)
    if (isLikedQuery.data.like == false) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.tweet_already_unliked))
        return
    }

    let unLikeTweetQuery = await unLikeTweet(userId, postId)

    res.send(utils.sendResponse(true, unLikeTweetQuery.data, PLACEHOLDER.empty_string))
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
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let tweetList = await getLikeTweetList(userId)

    if (tweetList.success == false) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field))
        return
    }

    res.send(utils.sendResponse(true, tweetList.data, PLACEHOLDER.empty_string))
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
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let userList = await getLikeUserList(postId)

    if (userList.success == false) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field))
        return
    }

    res.send(utils.sendResponse(true, userList.data, PLACEHOLDER.empty_string))
}

// utils.sendResponse(req,res,true, likeTweetQueryData, PLACEHOLDER.empty_string);