const Tweets = require('../classes/Tweets/Tweets')
const Users = require('../classes/Users/Users')
const Comments = require("../classes/Comments/Comments")

const Functions = require('../classes/Comments/Functions')
const Constants = require('../classes/Comments/Constants')
const text = require('../text').TEXT
const error = require('../errorConstants').ERROR
const utils = require('../utils')


/**
 * Add comment controller
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.addUserComment = async (req, res, next) => {
    console.log(req.body, req.url)

    let tweetId = req.body.postId // postId is tweetId
    let userId = req.userId
    let commentText = req.body.commentText || ""

    tweetId = parseInt(tweetId)
    userId = parseInt(userId)
    commentText = commentText.toString()

    if (isNaN(tweetId) || isNaN(userId) || commentText.length === 0) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    let userExistsQuery = await Users.findIfUserExists(userId) 

    if (userExistsQuery.data == null || userExistsQuery.success == false) {
        return utils.sendResponse(res, false, {}, error.user_doesnot_exist)
    }

    let tweetExistsQuery = await Tweets.findIfTweetExists(tweetId)

    if (tweetExistsQuery.data == null || tweetExistsQuery.success == false) {
        return utils.sendResponse(res, false, {}, error.tweet_doesnot_exist)
    }

    let addCommentQuery = await Comments.addComment(userId, userExistsQuery.data.name, commentText, tweetExistsQuery.data.id)

    if (addCommentQuery.data == null || addCommentQuery.success == false) {
        return utils.sendResponse(res, false, {}, error.add_comment_failed)
    }

    return utils.sendResponse(res, true, addCommentQuery.data, "")
}

/**
 * Get comments controller
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.getUserComments = async (req, res, next) => {
    console.log(req.params, req.baseUrl, req.url)

    let userId = req.userId
    let tweetId = req.body.postId
    let pageNo = req.headers.pageno || 1
    let pageSize = Constants.PAGESIZE

    userId = parseInt(userId)
    tweetId = parseInt(tweetId)
    pageNo = parseInt(pageNo)

    if (isNaN(userId) || isNaN(tweetId) || isNaN(pageNo)) {
        return utils.sendResponse(res, false, error.parameters_missing)
    }

    await Functions.validateUser(res, userId)

    let commentsQuery = await Comments.getComments(pageSize, pageNo, tweetId)
    
    if (commentsQuery.data == null || commentsQuery.success == false) {
        return utils.sendResponse(res, false, {}, error.error_data_field)
    }

    commentsQuery.data.Comments = Functions.getCountAndSelfLike(commentsQuery.data.Comments, userId)

    return utils.sendResponse(res, true, commentsQuery.data, "")
}

/**
 * Update comment controller
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.updateUserComment = async (req, res, next) => {
    console.log(req.body, req.baseUrl, req.url)

    let userId = req.userId
    let commentId = req.body.commentId
    let commentText = req.body.commentText || ""

    userId = parseInt(userId)
    commentId = parseInt(commentId)
    commentText = commentText.toString()

    if (isNaN(userId) || isNaN(commentId) || commentText.length === 0) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    await Functions.validateUser(res, userId)

    let updateCommentData = (await Comments.updateComment(commentId, userId, commentText)).data

    if (updateCommentData[0] === Constants.QUERYFAILED) {
        return utils.sendResponse(res, false, {}, error.comment_doesnot_exist)
    }

    return utils.sendResponse(res, true, text.comment_updated, "")
}

/**
 * Checks if comment is liked or not
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.isCommentLiked = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.userId
    let postId = req.body.postId

    userId = parseInt(userId)
    postId = parseInt(postId)

    if (isNaN(userId) || isNaN(postId)) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    await Functions.validateUser(res, userId)

    let isLikedData = (await Comments.isLiked(userId, postId)).data

    return utils.sendResponse(res, true, isLikedData, "")
}

/**
 * Like a comment
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.likeExistingComment = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.userId
    let postId = req.body.postId
    let likeType = req.body.likeType || ""

    userId = parseInt(userId)
    postId = parseInt(postId)
    likeType = likeType.toString()

    if (isNaN(userId) || isNaN(postId) || likeType.length === 0) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    await Functions.validateUser(res, userId)

    likeType = Constants.LIKETYPES[likeType]

    let alreadyLiked = (await Comments.isLiked(userId, postId)).data.like
    if (alreadyLiked == true) {
        return utils.sendResponse(res, false, {}, error.comment_already_liked)
    }

    let likeCommentData = (await Comments.likeComment(userId, postId, likeType)).data

    return utils.sendResponse(res, true, likeCommentData, "")
}

/**
 * Unlike a comment
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.unLikeExistingComment = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.userId
    let postId = req.body.postId

    userId = parseInt(userId)
    postId = parseInt(postId)

    if (isNaN(userId) || isNaN(postId)) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    await Functions.validateUser(res, userId)

    let isLiked = (await Comments.isLiked(userId, postId)).data.like
    if (isLiked === false) {
        return utils.sendResponse(res, false, {}, error.comment_already_unliked)
    }

    let unLikeTweetData = (await Comments.unLikeComment(userId, postId)).data

    return utils.sendResponse(res, true, unLikeTweetData, "")
}

/**
 * Gets list of comments liked by a user
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.userLikeCommentList = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.userId

    userId = parseInt(userId)

    if (isNaN(userId)) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    await Functions.validateUser(res, userId)

    let tweetList = await Comments.getLikeCommentList(userId)

    if (tweetList.success == false) {
        return utils.sendResponse(res, false, {}, error.error_data_field)
    }

    return utils.sendResponse(res, true, tweetList.data, "")
}

/**
 * Gets list of users who liked a comment
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.commentLikeUserList = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let postId = req.body.postId

    postId = parseInt(postId)

    if (isNaN(postId)) {
        return utils.sendResponse(res, false, {}, error.parameters_missing)
    }

    let userList = await Comments.getLikeUserList(postId)

    if (userList.success == false) {
        return utils.sendResponse(res, false, {}, error.error_data_field)
    }

    return utils.sendResponse(res, true, userList.data, "")
}
