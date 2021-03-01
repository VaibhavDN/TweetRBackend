const { findUserByLoginId } = require('../classes/Users/Users')
const { addNewTweet, updateExistingTweet, deleteExistingTweet, isLiked, likeTweet, unLikeTweet, getLikeUserList, getLikeTweetList } = require('../classes/Tweets/Tweets')
const { getFriendsTweets, getPublicTweets } = require('../classes/Users/Users')
const { SUCCESS } = require('../text')
const { ERROR } = require('../errorConstants')
const utils = require('../utils')
const { PLACEHOLDER, PAGESIZE, QUERYFAILED } = require('../classes/Tweets/Constants')
const { isEmailValid, isPhoneValid, reformatFriendTweetData, reformatPublicTweetData } = require('../classes/Tweets/Functions')

/**
 * Add new tweet controller
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.addTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let loginParam = req.body.loginid
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

    console.log(JSON.stringify(userExistsQuery))

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
    let friendsTweetsData = friendsTweets.data

    let reformatedData = reformatFriendTweetData(friendsTweetsData, userId)

    //console.log(JSON.parse(JSON.stringify(friendsTweetsData)))

    if (reformatedData.length != 0) {
        res.send(utils.sendResponse(true, reformatedData, PLACEHOLDER.empty_string))
        return
    }

    let publicTweets = await getPublicTweets(userId, pageSize, pageNo)
    let publicTweetsData = publicTweets.data

    console.log("Public tweets", JSON.stringify(publicTweets))

    reformatedData = reformatPublicTweetData(publicTweetsData, userId)

    if (reformatedData == null) {
        res.send(utils.sendResponse(false, {}, ERROR.user_doesnot_exist))
        return
    }

    //console.log("\n\nResponse", reformatedData)
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
    let updateTweetQueryData = updateTweetQuery.data

    if (updateTweetQueryData[0] === QUERYFAILED) {
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
    let tweetId = req.body.tweetId

    let isLikedQuery = await isLiked(userId, tweetId)
    let isLikedQueryData = isLikedQuery.data
    console.log(isLikedQueryData)

    res.send(utils.sendResponse(true, isLikedQueryData, PLACEHOLDER.empty_string))
}

exports.likeExistingTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId
    let tweetId = req.body.tweetId

    let isLikedQuery = await isLiked(userId, tweetId)
    if (isLikedQuery.data.like == true) {
        res.send(utils.sendResponse(false, {}, ERROR.tweet_already_liked))
        return
    }

    let likeTweetQuery = await likeTweet(userId, tweetId)
    let likeTweetQueryData = likeTweetQuery.data
    console.log(likeTweetQueryData)

    res.send(utils.sendResponse(true, likeTweetQueryData, PLACEHOLDER.empty_string))
}

exports.unLikeExistingTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId
    let tweetId = req.body.tweetId

    let isLikedQuery = await isLiked(userId, tweetId)
    if (isLikedQuery.data.like == false) {
        res.send(utils.sendResponse(false, {}, ERROR.tweet_already_unliked))
        return
    }

    let unLikeTweetQuery = await unLikeTweet(userId, tweetId)
    let unLikeTweetQueryData = unLikeTweetQuery.data
    console.log(unLikeTweetQueryData)

    res.send(utils.sendResponse(true, unLikeTweetQueryData, PLACEHOLDER.empty_string))
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
    let tweetListData = tweetList.data

    if (tweetList.success == false) {
        res.send(utils.sendResponse(false, {}, ERROR.error_data_field))
        return
    }

    res.send(utils.sendResponse(true, tweetListData, PLACEHOLDER.empty_string))
}

/**
 * Gets list of users who liked a tweet
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.tweetLikeUserList = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let tweetId = req.body.tweetId

    let userList = await getLikeUserList(tweetId)
    let userListData = userList.data

    if (userList.success == false) {
        res.send(utils.sendResponse(false, {}, ERROR.error_data_field))
        return
    }

    res.send(utils.sendResponse(true, userListData, PLACEHOLDER.empty_string))
}

// utils.sendResponse(req,res,true, likeTweetQueryData, PLACEHOLDER.empty_string);