const { Op } = require('sequelize')
const { Comments, CommentLike } = require('../../models/Comments')
const { Tweets } = require('../../models/Tweets')
const { ERROR } = require('../../errorConstants')
const utils = require('../../utils')
const { PLACEHOLDER } = require('./Constants')
const User = require('../../models/Users')
let queryResult = {
    success: false,
    data: {},
}

/**
 * Performs database call to get comments for a particular tweet
 * Also implements pagination
 * @param {Integer} pageSize 
 * @param {Integer} pageNo 
 * @param {Integer} tweetId 
 * 
 * @returns Query result
 */
exports.getComments = async (pageSize, pageNo, tweetId) => {
    let getCommentsQuery = await Tweets.findOne({
        include: {
            model: Comments,
            include: {
                model: CommentLike,
            },
            limit: pageSize,
            offset: ((pageNo - 1) * pageSize),
            order: [['updatedAt', 'ASC']],
        },
        where: {
            id: tweetId,
        }
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        queryResult = {
            success: false,
            data: ERROR.error_data_field,
        }
        return queryResult
    })

    queryResult = {
        success: true,
        data: getCommentsQuery,
    }
    //queryResult = utils.classResponse(true, getCommentsQuery, )
    return utils.jsonSafe(queryResult)
}

/**
 * Performs database call to add a comment at a particular tweet
 * @param {Integer} commentersId 
 * @param {String} name 
 * @param {String} commentText 
 * @param {Integer} tweetId 
 */
exports.addComment = async (commentersId, name, commentText, tweetId) => {
    let addCommentQuery = await Comments.create({
        commentersId: commentersId,
        commentersName: name,
        comment: commentText,
        postId: tweetId,
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        queryResult = {
            success: false,
            data: ERROR.error_data_field,
        }
        return queryResult
    })

    queryResult = {
        success: true,
        data: addCommentQuery,
    }
    return utils.jsonSafe(queryResult)
}

/**
 * Performs database call to update a particular comment
 * @param {Integer} commentId 
 * @param {Integer} commentersId 
 * @param {String} commentText 
 */
exports.updateComment = async (commentId, commentersId, commentText) => {
    let updateCommentQuery = await Comments.update({
        comment: commentText,
    }, {
        where: {
            [Op.and]: [
                { id: commentId },
                { commentersId: commentersId },
            ]
        }
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        queryResult = {
            success: false,
            data: ERROR.error_data_field,
        }
        return queryResult
    })

    queryResult = {
        success: true,
        data: updateCommentQuery,
    }
    return utils.jsonSafe(queryResult)
}

/**
 * Database call to check if a comment is liked
 * @param {Integer} userId 
 * @param {Integer} commentId 
 */
exports.isLiked = async (userId, commentId) => {
    console.log(userId, commentId)
    let isLikedQuery = await CommentLike.findOne({
        where: {
            'userId': userId,
            'commentId': commentId,
        }
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    if(isLikedQuery == null) {
        return utils.classResponse(true, {like: false}, PLACEHOLDER.empty_string)
    }

    return utils.classResponse(true, {like: true}, PLACEHOLDER.empty_string)
}

/**
 * Database call to like a comment
 * @param {Integer} userId 
 * @param {Integer} commentId 
 */
exports.likeComment = async (userId, commentId) => {
    let likeCommentQuery = await CommentLike.create({
        userId: userId,
        commentId: commentId,
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, likeCommentQuery, PLACEHOLDER.empty_string)
}

/**
 * Database call to unlike a comment
 * @param {Integer} userId 
 * @param {Integer} commentId 
 */
exports.unLikeComment = async (userId, commentId) => {
    let unLikeCommentQuery = await CommentLike.destroy({
        where: {
            userId: userId,
            commentId: commentId,
        }
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, unLikeCommentQuery, PLACEHOLDER.empty_string)
}

/**
 * Get list of users who like a comment
 * @param {Integer} tweetId 
 */
exports.getLikeUserList = async (commentId) => {
    let userListQuery = await CommentLike.findAll({
        where: {
            commentId: commentId,
        },
        include: {
            attributes: ['id', 'name', 'loginid'],
            model: User,
        },
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, userListQuery, PLACEHOLDER.empty_string)
}

/**
 * Get list of comments liked by a user
 * @param {Integer} userId 
 */
exports.getLikeCommentList = async (userId) => {
    let commentListQuery = await CommentLike.findAll({
        where: {
            userId: userId,
        },
        include: {
            model: Comments,
        },
    }).catch((err) => {
        console.log(ERROR.query_error, err)
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, commentListQuery, PLACEHOLDER.empty_string)
}

