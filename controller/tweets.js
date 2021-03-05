const Tweets = require('../classes/Tweets/Tweets')
const Users = require('../classes/Users/Users')
const Relationships = require('../classes/Relationships/Relationships')

const Functions = require('../classes/Tweets/Functions')
const Constants = require('../classes/Tweets/Constants')
const text = require('../text').TEXT
const error = require('../errorConstants').ERROR
const utils = require('../utils')


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
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    if (!Functions.isEmailValid(loginParam) && !Functions.isPhoneValid(loginParam)) {
        return utils.sendResponse(res, false, {}, error.invalid_email_phoneno)
    }

    let userExistsQuery = await Users.findUserByLoginId(loginParam)

    if (userExistsQuery.data == null || userExistsQuery.success == false) {
        return utils.sendResponse(res, false, {}, error.user_doesnot_exist)
    }

    let newTweetQuery = await Tweets.addNewTweet(userExistsQuery.data.id, userExistsQuery.data.name, userExistsQuery.data.loginid, tweettext) 

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
    console.log(req.headers, req.baseUrl, req.url)

    let userId = req.userId
    let pageNo = req.headers.pageno || 1
    let pageSize = Constants.PAGESIZE

    userId = parseInt(userId)
    pageNo = parseInt(pageNo)

    if (Number.isNaN(pageNo) || Number.isNaN(userId)) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    await Functions.validateUser(res, userId)

    let friendsTweets = await Users.getFriendsTweets(userId, pageSize, pageNo)
    let reformatedData = Functions.reformatFriendTweetData(friendsTweets.data, userId)

    if (reformatedData.length != 0) {
        return utils.sendResponse(res, true, reformatedData, "")
    }

    let friendListQuery = await Relationships.getFriendList(userId)
    let friendList = Functions.getFriendsArray(friendListQuery.data, userId)

    let publicTweets = await Users.getPublicTweets(userId, pageSize, pageNo, friendList)
    reformatedData = Functions.reformatPublicTweetData(publicTweets.data, userId)

    if (reformatedData == null) {
        return utils.sendResponse(res, false, {}, error.user_doesnot_exist)
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
    console.log(req.body, req.baseUrl)

    let userId = req.userId
    let tweetId = req.body.tweetId
    let tweettext = req.body.tweettext || ""

    userId = parseInt(userId)
    tweetId = parseInt(tweetId)
    tweettext = tweettext.toString()

    if (Number.isNaN(userId) || Number.isNaN(tweetId) || tweettext.length === 0) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    await Functions.validateUser(res, userId)

    let updateTweetData = (await Tweets.updateExistingTweet(tweetId, userId, tweettext)).data

    if (updateTweetData[0] === Constants.QUERYFAILED) {
        return utils.sendResponse(res, false, {}, error.tweet_doesnot_exist)
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
    console.log(req.body, req.baseUrl)

    let tweetId = req.body.tweetId
    tweetId = parseInt(tweetId)

    if (Number.isNaN(tweetId)) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    let data = (await Tweets.deleteExistingTweet(tweetId)).data

    if (data === Constants.QUERYFAILED) {
        return utils.sendResponse(res, false, {}, error.tweet_doesnot_exist)
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
    console.log(req.body, req.baseUrl)

    let userId = req.userId
    let postId = req.body.postId

    userId = parseInt(userId)
    postId = parseInt(postId)

    if (Number.isNaN(userId) || Number.isNaN(postId)) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    await Functions.validateUser(res, userId)

    let data = (await Tweets.isLiked(userId, postId)).data

    return utils.sendResponse(res, true, data, "")
}

/**
 * Likes a tweet
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.likeExistingTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.userId
    let postId = req.body.postId
    let likeType = req.body.likeType || ""

    userId = parseInt(userId)
    postId = parseInt(postId)
    likeType = likeType.toString()

    if (Number.isNaN(userId) || Number.isNaN(postId) || likeType.length === 0) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    await Functions.validateUser(res, userId)

    likeType = Constants.LIKETYPES[likeType]

    let alreadyLiked = (await Tweets.isLiked(userId, postId)).data.like
    if (alreadyLiked === true) {
        return utils.sendResponse(res, false, {}, error.tweet_already_liked)
    }

    let likeTweetData = (await Tweets.likeTweet(userId, postId, likeType)).data

    return utils.sendResponse(res, true, likeTweetData, "")
}

/**
 * Unlikes a tweet
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.unLikeExistingTweet = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.userId
    let postId = req.body.postId

    userId = parseInt(userId)
    postId = parseInt(postId)

    if (Number.isNaN(userId) || Number.isNaN(postId)) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    await Functions.validateUser(res, userId)

    let liked = (await Tweets.isLiked(userId, postId)).data.like
    if (liked === false) {
        return utils.sendResponse(res, false, {}, error.tweet_already_unliked)
    }

    let unLikeTweetData = (await Tweets.unLikeTweet(userId, postId)).data

    return utils.sendResponse(res, true, unLikeTweetData, "")
}

/**
 * Gets list of tweets liked by a user
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.userLikeTweetList = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.userId
    userId = parseInt(userId)

    if (Number.isNaN(userId)) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    await Functions.validateUser(res, userId)

    let tweetList = await Tweets.getLikeTweetList(userId)

    if (tweetList.success == false) {
        return utils.sendResponse(res, false, {}, error.error_data_field)
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
    console.log(req.body, req.baseUrl)

    let postId = req.body.postId
    postId = parseInt(postId)

    if (Number.isNaN(postId)) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    let userList = await Tweets.getLikeUserList(postId)

    if (userList.success === false) {
        return utils.sendResponse(res, false, {}, error.error_data_field)
    }

    return utils.sendResponse(res, true, userList.data, "")
}
