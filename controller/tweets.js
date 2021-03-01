const { findUserByLoginId } = require('../classes/Users/Users')
const { addNewTweet, updateExistingTweet, deleteExistingTweet, isLiked, likeTweet, unLikeTweet, getLikeUserList, getLikeTweetList } = require('../classes/Tweets/Tweets')
const { getFriendsTweets, getPublicTweets } = require('../classes/Users/Users')
const { SUCCESS } = require('../text')
const { ERROR } = require('../errorConstants')
const utils = require('../utils')
const { PLACEHOLDER, PAGESIZE, QUERYFAILED } = require('../classes/Tweets/Constants')
const { isEmailValid, isPhoneValid } = require('../classes/Tweets/Functions')

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

    //* Construction zone starts here

    let friendsTweets = await getFriendsTweets(userId, pageSize, pageNo)
    let friendsTweetsData = friendsTweets.data

    let reformatedData = []
    let count = 0

    const extractTweets = (tweet, id, name, loginid) => {
        console.log(tweet)
        reformatedData.push({})
        reformatedData[count]['id'] = id
        reformatedData[count]['name'] = name
        reformatedData[count]['loginid'] = loginid
        reformatedData[count]['userId'] = tweet.dataValues.userId
        reformatedData[count]['tweet'] = tweet.dataValues.tweet
        reformatedData[count]['likeCount'] = tweet.Likes.length
        reformatedData[count]['selfLike'] = false
        for (let itr = 0; itr < tweet.Likes.length; itr++) {
            if (tweet.Likes[itr].userId == userId) {
                reformatedData[count]['selfLike'] = true
                break
            }
        }
        reformatedData[count]['like'] = tweet.Likes
        reformatedData[count]['createdAt'] = tweet.dataValues.createdAt
        reformatedData[count]['updatedAt'] = tweet.dataValues.updatedAt
        count++
    }

    const reformatFriendTweetData = (data) => {
        data.dataValues.Tweets.forEach((item) => {
            extractTweets(item, data.dataValues.id, data.dataValues.name, data.dataValues.loginid)
        })
    }

    friendsTweetsData.forEach(reformatFriendTweetData)

    if (reformatedData.length != 0) {
        res.send(utils.sendResponse(true, reformatedData, PLACEHOLDER.empty_string))
        return
    }

    //* Construction zone ends here


    let publicTweets = await getPublicTweets(userId, pageSize, pageNo)
    let publicTweetsData = publicTweets.data

    console.log(JSON.stringify(publicTweets))

    count = 0

    const reformatPublicTweetData = (data) => {
        reformatedData.push({})
        reformatedData[count]['id'] = data.id
        reformatedData[count]['name'] = data.name
        reformatedData[count]['loginid'] = data.loginid
        reformatedData[count]['userId'] = data.userId
        reformatedData[count]['tweet'] = data.tweet
        reformatedData[count]['likeCount'] = data.Likes.length
        reformatedData[count]['selfLike'] = false
        for (let itr = 0; itr < data.Likes.length; itr++) {
            if (data.Likes[itr].userId == userId) {
                reformatedData[count]['selfLike'] = true
                break
            }
        }
        reformatedData[count]['like'] = data.Likes
        reformatedData[count]['createdAt'] = data.createdAt
        reformatedData[count]['updatedAt'] = data.updatedAt
        count++
    }

    publicTweetsData.forEach(reformatPublicTweetData)

    if (reformatedData == null) {
        res.send(utils.sendResponse(false, {}, ERROR.user_doesnot_exist))
        return
    }

    console.log("\n\nResponse", reformatedData)
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

    if(tweetList.success == false) {
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

    if(userList.success == false) {
        res.send(utils.sendResponse(false, {}, ERROR.error_data_field))
        return
    }

    res.send(utils.sendResponse(true, userListData, PLACEHOLDER.empty_string))
}

// utils.sendResponse(req,res,true, likeTweetQueryData, PLACEHOLDER.empty_string);