const { findIfTweetExists } = require('../classes/Tweets/Tweets')
const { findIfUserExists } = require('../classes/Users/Users')
const { getComments, updateComment, addComment, isLiked, unLikeComment, likeComment, getLikeCommentList, getLikeUserList } = require("../classes/Comments/Comments")
const { TEXT } = require('../text')
const { ERROR } = require('../errorConstants')
const utils = require('../utils')
const { PLACEHOLDER, PAGESIZE, QUERYFAILED } = require('../classes/Comments/Constants')
const { getCountAndSelfLike } = require('../classes/Comments/Functions')

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
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let userExistsQuery = await findIfUserExists(commentersId)
    let userExistsQueryStatus = userExistsQuery.success
    let userExistsQueryData = userExistsQuery.data

    if (userExistsQueryData == null || userExistsQueryStatus == false) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.user_doesnot_exist))
        return
    }

    let tweetExistsQuery = await findIfTweetExists(tweetId)
    let tweetExistsQueryStatus = tweetExistsQuery.success
    let tweetExistsQueryData = tweetExistsQuery.data

    if (tweetExistsQueryData == null || tweetExistsQueryStatus == false) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.tweet_doesnot_exist))
        return
    }

    let addCommentQuery = await addComment(commentersId, userExistsQueryData.name, commentText, tweetExistsQueryData.id)
    let addCommentQueryStatus = addCommentQuery.success

    if (addCommentQuery.data == null || addCommentQueryStatus == false) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.add_comment_failed))
        return
    }

    res.send(utils.sendResponse(true, addCommentQuery.data, PLACEHOLDER.empty_string))
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
    let pageSize = PAGESIZE

    userId = Number.parseInt(userId)
    tweetId = Number.parseInt(tweetId)
    pageNo = Number.parseInt(pageNo)

    if (userId <= 0 || tweetId <= 0 || pageNo <= 0) {
        res.send(utils.sendResponse(false, ERROR.parameters_missing))
        return
    }

    let commentsQuery = await getComments(pageSize, pageNo, tweetId)
    if (!commentsQuery.success) {
        res.send(utils.sendResponse(commentsQuery.success, commentsQuery.data, commentsQuery.err));
    }
    let commentsQueryStatus = commentsQuery.success

    console.log(commentsQuery.data.Comments)
    commentsQuery.data.Comments = getCountAndSelfLike(commentsQuery.data.Comments, userId)

    if (commentsQuery.data == null || commentsQueryStatus.success == false) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field))
        return
    }

    res.send(utils.sendResponse(true, commentsQuery.data, PLACEHOLDER.empty_string))
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
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let updateCommentQuery = await updateComment(commentId, commentersId, commentText)
    let queryData = updateCommentQuery.data

    if (queryData[0] === QUERYFAILED) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.comment_doesnot_exist))
        return
    }

    res.send(utils.sendResponse(true, TEXT.comment_updated, PLACEHOLDER.empty_string))
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
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let isLikedQuery = await isLiked(userId, postId)

    res.send(utils.sendResponse(true, isLikedQuery.data, PLACEHOLDER.empty_string))
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

    userId = Number.parseInt(userId)
    postId = Number.parseInt(postId)

    if (userId <= 0 || postId <= 0) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let isLikedQuery = await isLiked(userId, postId)
    if (isLikedQuery.data.like == true) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.comment_already_liked))
        return
    }

    let likeCommentQuery = await likeComment(userId, postId)

    res.send(utils.sendResponse(true, likeCommentQuery.data, PLACEHOLDER.empty_string))
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
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let isLikedQuery = await isLiked(userId, postId)
    if (isLikedQuery.data.like == false) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.comment_already_unliked))
        return
    }

    let unLikeTweetQuery = await unLikeComment(userId, postId)

    res.send(utils.sendResponse(true, unLikeTweetQuery.data, PLACEHOLDER.empty_string))
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
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let tweetList = await getLikeCommentList(userId)

    if (tweetList.success == false) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field))
        return
    }

    res.send(utils.sendResponse(true, tweetList.data, PLACEHOLDER.empty_string))
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
