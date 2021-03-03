const tweets = require('../classes/Tweets/Tweets')
const users = require('../classes/Users/Users')
const comments = require("../classes/Comments/Comments")
const text = require('../text')
const error = require('../errorConstants')
const utils = require('../utils')
const constants = require('../classes/Comments/Constants')
const functions = require('../classes/Comments/Functions')

/**
 * Add comment controller
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.addUserComment = async (req, res, next) => {
    console.log(req.body, req.url)

    let tweetId = req.body.postId || -1 // postId is tweetId
    let commentersId = req.body.commentersId || -1
    let commentText = req.body.commentText || ""

    tweetId = Number.parseInt(tweetId)
    commentersId = Number.parseInt(commentersId)
    commentText = commentText.toString()

    if (tweetId <= 0 || commentersId <= 0 || commentText.length === 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.parameters_missing)
    }

    let userExistsQuery = await users.findIfUserExists(commentersId)
    let userExistsQueryStatus = userExistsQuery.success
    let userExistsQueryData = userExistsQuery.data

    if (userExistsQueryData == null || userExistsQueryStatus == false) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.user_doesnot_exist)
    }

    let tweetExistsQuery = await tweets.findIfTweetExists(tweetId)
    let tweetExistsQueryStatus = tweetExistsQuery.success
    let tweetExistsQueryData = tweetExistsQuery.data

    if (tweetExistsQueryData == null || tweetExistsQueryStatus == false) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.tweet_doesnot_exist)
    }

    let addCommentQuery = await comments.addComment(commentersId, userExistsQueryData.name, commentText, tweetExistsQueryData.id)
    let addCommentQueryStatus = addCommentQuery.success

    if (addCommentQuery.data == null || addCommentQueryStatus == false) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.add_comment_failed)
    }

    return utils.sendResponse(res, true, addCommentQuery.data, constants.PLACEHOLDER.empty_string)
}

/**
 * Get comments controller
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.getUserComments = async (req, res, next) => {
    console.log(req.params, req.baseUrl, req.url)

    let userId = req.params.userId || -1
    let tweetId = req.params.postId || -1
    let pageNo = req.params.pageNo || -1
    let pageSize = constants.PAGESIZE

    userId = Number.parseInt(userId)
    tweetId = Number.parseInt(tweetId)
    pageNo = Number.parseInt(pageNo)

    if (userId <= 0 || tweetId <= 0 || pageNo <= 0) {
        return utils.sendResponse(res, false, error.ERROR.parameters_missing)
    }

    await functions.validateUser(res, userId)

    let commentsQuery = await comments.getComments(pageSize, pageNo, tweetId)
    if (!commentsQuery.success) {
        return utils.sendResponse(res, commentsQuery.success, commentsQuery.data, commentsQuery.err)
    }
    let commentsQueryStatus = commentsQuery.success

    console.log(commentsQuery.data.Comments)
    commentsQuery.data.Comments = functions.getCountAndSelfLike(commentsQuery.data.Comments, userId)

    if (commentsQuery.data == null || commentsQueryStatus.success == false) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.error_data_field)
    }

    return utils.sendResponse(res, true, commentsQuery.data, constants.PLACEHOLDER.empty_string)
}

/**
 * Update comment controller
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.updateUserComment = async (req, res, next) => {
    console.log(req.body, req.baseUrl, req.url)

    let commentersId = req.body.commentersId || -1
    let commentId = req.body.commentId || -1
    let commentText = req.body.commentText || ""

    commentersId = Number.parseInt(commentersId)
    commentId = Number.parseInt(commentId)
    commentText = commentText.toString()

    if (commentersId <= 0 || commentId <= 0 || commentText.length === 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.parameters_missing)
    }

    let updateCommentQuery = await comments.updateComment(commentId, commentersId, commentText)
    let queryData = updateCommentQuery.data

    if (queryData[0] === constants.QUERYFAILED) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.comment_doesnot_exist)
    }

    return utils.sendResponse(res, true, text.TEXT.comment_updated, constants.PLACEHOLDER.empty_string)
}

/**
 * Checks if comment is liked or not
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.isCommentLiked = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId || -1
    let postId = req.body.postId || -1

    userId = Number.parseInt(userId)
    postId = Number.parseInt(postId)

    if (userId <= 0 || postId <= 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.parameters_missing)
    }

    let isLikedQuery = await comments.isLiked(userId, postId)

    return utils.sendResponse(res, true, isLikedQuery.data, constants.PLACEHOLDER.empty_string)
}

/**
 * Like a comment
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.likeExistingComment = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId || -1
    let postId = req.body.postId || -1
    let likeType = req.body.likeType || ""

    userId = Number.parseInt(userId)
    postId = Number.parseInt(postId)
    likeType = likeType.toString()

    if (userId <= 0 || postId <= 0 || likeType.length === 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.parameters_missing)
    }

    likeType = constants.LIKETYPES[likeType]

    let isLikedQuery = await comments.isLiked(userId, postId)
    if (isLikedQuery.data.like == true) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.comment_already_liked)
    }

    let likeCommentQuery = await comments.likeComment(userId, postId, likeType)

    return utils.sendResponse(res, true, likeCommentQuery.data, constants.PLACEHOLDER.empty_string)
}

/**
 * Unlike a comment
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.unLikeExistingComment = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId || -1
    let postId = req.body.postId || -1

    userId = Number.parseInt(userId)
    postId = Number.parseInt(postId)

    if (userId <= 0 || postId <= 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.parameters_missing)
    }

    let isLikedQuery = await comments.isLiked(userId, postId)
    if (isLikedQuery.data.like == false) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.comment_already_unliked)
    }

    let unLikeTweetQuery = await comments.unLikeComment(userId, postId)

    return utils.sendResponse(res, true, unLikeTweetQuery.data, constants.PLACEHOLDER.empty_string)
}

/**
 * Gets list of comments liked by a user
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.userLikeCommentList = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId || -1

    userId = Number.parseInt(userId)

    if (userId <= 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.parameters_missing)
    }

    let tweetList = await comments.getLikeCommentList(userId)

    if (tweetList.success == false) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.error_data_field)
    }

    return utils.sendResponse(res, true, tweetList.data, constants.PLACEHOLDER.empty_string)
}

/**
 * Gets list of users who liked a comment
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.commentLikeUserList = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let postId = req.body.postId || -1

    postId = Number.parseInt(postId)

    if (postId <= 0) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.parameters_missing)
    }

    let userList = await comments.getLikeUserList(postId)

    if (userList.success == false) {
        return utils.sendResponse(res, false, constants.PLACEHOLDER.empty_response, error.ERROR.error_data_field)
    }

    return utils.sendResponse(res, true, userList.data, constants.PLACEHOLDER.empty_string)
}
