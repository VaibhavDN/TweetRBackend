const { findUserByLoginId } = require('../classes/Users/Users')
const { addNewTweet, updateExistingTweet, deleteExistingTweet, isLiked, likeTweet, unLikeTweet, getLikeUserList, getLikeTweetList } = require('../classes/Tweets/Tweets')
const { getFriendsTweets, getPublicTweets } = require('../classes/Users/Users')
const { SUCCESS } = require('../text')
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

    let userId = req.params.userId
    let pageNo = req.params.pageNo
    let pageSize = PAGESIZE

    if (!pageNo || !userId) {
        res.send(utils.sendResponse(false, {}, ERROR.parameters_missing))
        return
    }

    let friendsTweets = await getFriendsTweets(userId, pageSize, pageNo)
    let reformatedData = reformatFriendTweetData(friendsTweets.data, userId)

    if (reformatedData.length != 0) {
        res.send(utils.sendResponse(true, reformatedData, PLACEHOLDER.empty_string))
        return
    }

    let friendListQuery = await getFriendList(userId)
    let friendList = getFriendsArray(friendListQuery.data)

    let publicTweets = await getPublicTweets(userId, pageSize, pageNo, friendList)
    reformatedData = reformatPublicTweetData(publicTweets.data, userId)

    if (reformatedData == null) {
        res.send(utils.sendResponse(false, {}, ERROR.user_doesnot_exist))
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

    let userId = req.body.userId
    let tweetId = req.body.id
    let tweetText = req.body.tweetText

    if (!userId || !tweetId || !tweetText) {
        res.send(utils.sendResponse(false, {}, ERROR.parameters_missing))
        return
    }

    let updateTweetQuery = await updateExistingTweet(tweetId, userId, tweetText)

    if (updateTweetQuery.data[0] === QUERYFAILED) {
        res.send(utils.sendResponse(false, {}, ERROR.tweet_doesnot_exist))
        return
    }

    res.send(utils.sendResponse(true, SUCCESS.tweet_updated, PLACEHOLDER.empty_string))
}

/**
 * Delete an existing tweet
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.deleteTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let tweetId = req.body.id

    if (!tweetId) {
        res.send(utils.sendResponse(false, {}, ERROR.parameters_missing))
        return
    }

    let deleteQuery = await deleteExistingTweet(tweetId)
    let deleteQueryData = deleteQuery.data

    if (deleteQueryData == 0) {
        res.send(utils.sendResponse(false, {}, ERROR.tweet_doesnot_exist))
        return
    }

    res.send(utils.sendResponse(true, SUCCESS.tweet_deleted, PLACEHOLDER.empty_string))
}

exports.isTweetLiked = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId
    let postId = req.body.postId

    let isLikedQuery = await isLiked(userId, postId)

    res.send(utils.sendResponse(true, isLikedQuery.data, PLACEHOLDER.empty_string))
}

exports.likeExistingTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId
    let postId = req.body.postId
    let likeType = req.body.likeType

    let isLikedQuery = await isLiked(userId, postId)
    if (isLikedQuery.data.like == true) {
        res.send(utils.sendResponse(false, {}, ERROR.tweet_already_liked))
        return
    }

    let likeTweetQuery = await likeTweet(userId, postId, likeType)

    res.send(utils.sendResponse(true, likeTweetQuery.data, PLACEHOLDER.empty_string))
}

exports.unLikeExistingTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId
    let postId = req.body.postId

    let isLikedQuery = await isLiked(userId, postId)
    if (isLikedQuery.data.like == false) {
        res.send(utils.sendResponse(false, {}, ERROR.tweet_already_unliked))
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

    let userId = req.body.userId

    let tweetList = await getLikeTweetList(userId)

    if (tweetList.success == false) {
        res.send(utils.sendResponse(false, {}, ERROR.error_data_field))
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

    let postId = req.body.postId

    let userList = await getLikeUserList(postId)

    if (userList.success == false) {
        res.send(utils.sendResponse(false, {}, ERROR.error_data_field))
        return
    }

    res.send(utils.sendResponse(true, userList.data, PLACEHOLDER.empty_string))
}

// utils.sendResponse(req,res,true, likeTweetQueryData, PLACEHOLDER.empty_string);