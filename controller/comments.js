const { findIfTweetExists } = require('../classes/Tweets/Tweets')
const { findIfUserExists } = require('../classes/Users/Users')
const { getComments, updateComment, addComment, isLiked, unLikeComment, likeComment, getLikeCommentList, getLikeUserList } = require("../classes/Comments/Comments")
const { SUCCESS } = require('../text')
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
exports.addUserComment = async(req, res, next) => {
    console.log(req.body, req.url)

    let tweetId = req.body.postId // postId is tweetId
    let commentersId = req.body.commentersId
    let commentText = req.body.commentText

    if(!commentersId || !commentText) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let userExistsQuery = await findIfUserExists(commentersId)
    let userExistsQueryStatus = userExistsQuery.success
    let userExistsQueryData = userExistsQuery.data

    if(userExistsQueryData == null || userExistsQueryStatus == false) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.user_doesnot_exist))
        return
    }

    let tweetExistsQuery = await findIfTweetExists(tweetId)
    let tweetExistsQueryStatus = tweetExistsQuery.success
    let tweetExistsQueryData = tweetExistsQuery.data

    if(tweetExistsQueryData == null || tweetExistsQueryStatus == false) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.tweet_doesnot_exist))
        return
    }

    let addCommentQuery = await addComment(commentersId, userExistsQueryData.name, commentText, tweetExistsQueryData.id)
    let addCommentQueryStatus = addCommentQuery.success

    if(addCommentQuery.data == null || addCommentQueryStatus == false) {
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

    let userId = req.params.userId
    let tweetId = req.params.postId
    let pageNo = req.params.pageNo
    let pageSize = PAGESIZE

    if (!pageNo || !tweetId) {
        res.send(utils.sendResponse(false, ERROR.parameters_missing))
        return
    }

    let commentsQuery = await getComments(pageSize, pageNo, tweetId)
    if(!commentsQuery.success){
        res.send(utils.sendResponse(commentsQuery.success,commentsQuery.data,commentsQuery.err));
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
exports.updateUserComment = async(req, res, next) => {
    console.log(req.body, req.baseUrl, req.url)

    let commentersId = req.body.commentersId
    let commentId = req.body.commentId
    let commentText = req.body.commentText

    if(!commentersId || !commentId || !commentText) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.parameters_missing))
        return
    }

    let updateCommentQuery = await updateComment(commentId, commentersId, commentText)
    let queryData = updateCommentQuery.data

    if(queryData[0] === QUERYFAILED) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.comment_doesnot_exist))
        return
    }

    res.send(utils.sendResponse(true, SUCCESS.comment_updated, PLACEHOLDER.empty_string))
}

/**
 * Checks if comment is liked or not
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.isCommentLiked = async (req, res, next) => {
    console.log(req.body, req.baseUrl)

    let userId = req.body.userId
    let postId = req.body.postId

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

    let userId = req.body.userId
    let postId = req.body.postId

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

    let userId = req.body.userId
    let postId = req.body.postId

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

    let userId = req.body.userId

    let tweetList = await getLikeCommentList(userId)

    if(tweetList.success == false) {
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

    let postId = req.body.postId

    let userList = await getLikeUserList(postId)

    if(userList.success == false) {
        res.send(utils.sendResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field))
        return
    }

    res.send(utils.sendResponse(true, userList.data, PLACEHOLDER.empty_string))
}
