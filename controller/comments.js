const utils = require('../utils')

const Tweets = require('../classes/Tweets/Tweets')
const Users = require('../classes/Users/Users')
const Comments = require("../classes/Comments/Comments")
const Like = require('../classes/Likes/Likes')
const Functions = require('../classes/Comments/Functions')
const Constants = require('../classes/Comments/Constants')

const text = require('../text').TEXT
const ERROR = require('../errorConstants').ERROR

/**
 * Add comment controller
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.addUserComment = async (req, res, next) => {
    let body = req.body
    let tweetId = parseInt(body.postId)
    let userId = parseInt(req.user)
    let commentText = body.commentText || ""

    if (utils.checkIsNaN(tweetId, userId) || commentText.length === 0) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    let userExistsQuery = await Users.findIfUserExists(userId)

    if (userExistsQuery.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (userExistsQuery.data == null) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    let tweetExistsQuery = await Tweets.findIfTweetExists(tweetId)

    if (tweetExistsQuery.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (tweetExistsQuery.data == null) {
        return utils.sendResponse(res, false, {}, ERROR.tweet_doesnot_exist)
    }

    let addCommentQuery = await Comments.addComment(userId, userExistsQuery.data.name, commentText, tweetExistsQuery.data.id)

    if (addCommentQuery.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (addCommentQuery.data == null) {
        return utils.sendResponse(res, false, {}, ERROR.add_comment_failed)
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
    let userId = parseInt(req.user)
    let tweetId = parseInt(req.query.postid)
    let pageNo = parseInt(req.query.page) || 1
    let pageSize = Constants.PAGESIZE

    if (utils.checkIsNaN(userId, tweetId, pageNo)) {
        return utils.sendResponse(res, false, ERROR.parameters_missing)
    }

    if (!await Functions.validateUser(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    let commentsQuery = await Comments.getComments(pageSize, pageNo, tweetId)

    if (commentsQuery.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (commentsQuery.data == null) {
        return utils.sendResponse(res, false, {}, ERROR.error_data_field)
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
    let body = req.body
    let userId = parseInt(req.user)
    let commentId = parseInt(body.commentId)
    let commentText = body.commentText || ""

    if (utils.checkIsNaN(userId, commentId) || commentText.length === 0) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if (!await Functions.validateUser(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    let updateCommentQuery = await Comments.updateComment(commentId, userId, commentText)
    let updateCommentData = updateCommentQuery.data

    if (updateCommentQuery.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (updateCommentData[0] === Constants.QUERYFAILED) {
        return utils.sendResponse(res, false, {}, ERROR.comment_doesnot_exist)
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
    let userId = parseInt(req.user)
    let postId = parseInt(req.body.postId)

    if (utils.checkIsNaN(userId, postId)) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if (!await Functions.validateUser(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    let isLikedQuery = await Like.isCommentLiked(userId, postId)
    let isLikedData = isLikedQuery.data

    if (isLikedQuery.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    return utils.sendResponse(res, true, isLikedData, "")
}

/**
 * Like a comment
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.likeExistingComment = async (req, res, next) => {
    let body = req.body
    let userId = parseInt(req.user)
    let postId = parseInt(body.postId)
    let likeType = body.likeType || ""

    if (utils.checkIsNaN(userId, postId) || likeType.length === 0) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if (!await Functions.validateUser(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    likeType = Constants.LIKETYPES[likeType]

    let alreadyLikedQuery = await Like.isCommentLiked(userId, postId)
    let alreadyLiked = alreadyLikedQuery.data.like

    if (alreadyLikedQuery.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (alreadyLiked == true) {
        return utils.sendResponse(res, false, {}, ERROR.comment_already_liked)
    }

    let likeCommentQuery = await Like.likeComment(userId, postId, likeType)

    if (likeCommentQuery.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    return utils.sendResponse(res, true, likeCommentQuery.data, "")
}

/**
 * Unlike a comment
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.unLikeExistingComment = async (req, res, next) => {
    let userId = parseInt(req.user)
    let postId = parseInt(req.body.postId)

    if (utils.checkIsNaN(userId, postId)) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if (!await Functions.validateUser(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    let isLikedQuery = await Like.isCommentLiked(userId, postId)

    if (isLikedQuery.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    if (isLikedQuery.data === false) {
        return utils.sendResponse(res, false, {}, ERROR.comment_already_unliked)
    }

    let unLikeTweetQuery = await Like.unLikeComment(userId, postId)

    if (unLikeTweetQuery.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.query_error)
    }

    return utils.sendResponse(res, true, unLikeTweetQuery.data, "")
}

/**
 * Gets list of comments liked by a user
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.userLikeCommentList = async (req, res, next) => {
    let userId = parseInt(req.user)

    if (utils.checkIsNaN(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    if (!await Functions.validateUser(userId)) {
        return utils.sendResponse(res, false, {}, ERROR.user_doesnot_exist)
    }

    let tweetList = await Like.getLikeCommentList(userId)

    if (tweetList.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.error_data_field)
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
    let postId = parseInt(req.body.postId)

    if (utils.checkIsNaN(postId)) {
        return utils.sendResponse(res, false, {}, ERROR.parameters_missing)
    }

    let userList = await Like.getCommentLikeUserList(postId)

    if (userList.success === false) {
        return utils.sendResponse(res, false, {}, ERROR.error_data_field)
    }

    return utils.sendResponse(res, true, userList.data, "")
}
