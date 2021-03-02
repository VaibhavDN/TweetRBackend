const { Op } = require('sequelize')
const { Comments, CommentLike } = require('../../models/Comments')
const { Tweets } = require('../../models/Tweets')
const { ERROR } = require('../../errorConstants')
const utils = require('../../utils')
const { PLACEHOLDER, POSTTYPE } = require('./Constants')
const User = require('../../models/Users')
const { Like } = require('../../models/Like')
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
                model: Like,
                where: {
                    postType: POSTTYPE.comment
                },
                required: false,
            },
            limit: pageSize,
            offset: ((pageNo - 1) * pageSize),
            order: [['updatedAt', 'ASC']],
        },
        where: {
            id: tweetId,
        }
    }).catch((err) => {
        queryResult = {
            success: false,
            data: ERROR.error_data_field
        }
        return queryResult
    })

    queryResult = {
        success: true,
        data: getCommentsQuery,
    }
    //console.log(queryResult)
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
exports.isLiked = async (userId, postId) => {
    let isLikedQuery = await Like.findOne({
        where: {
            'userId': userId,
            'postId': postId,
            'postType': POSTTYPE.comment,
        }
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    if (isLikedQuery == null) {
        return utils.classResponse(true, { like: false }, PLACEHOLDER.empty_string)
    }

    return utils.classResponse(true, { like: true }, PLACEHOLDER.empty_string)
}

/**
 * Database call to like a comment
 * @param {Integer} userId 
 * @param {Integer} commentId 
 */
exports.likeComment = async (userId, postId) => {
    let likeCommentQuery = await Like.create({
        'userId': userId,
        'postId': postId,
        'postType': POSTTYPE.comment,
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, likeCommentQuery, PLACEHOLDER.empty_string)
}

/**
 * Database call to unlike a comment
 * @param {Integer} userId 
 * @param {Integer} commentId 
 */
exports.unLikeComment = async (userId, postId) => {
    let unLikeCommentQuery = await Like.destroy({
        where: {
            'userId': userId,
            'postId': postId,
            'postType': POSTTYPE.comment,
        }
    }).catch((err) => {
        console.log(err)
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, unLikeCommentQuery, PLACEHOLDER.empty_string)
}

/**
 * Get list of users who like a comment
 * @param {Integer} tweetId 
 */
exports.getLikeUserList = async (postId) => {
    let userListQuery = await Like.findAll({
        where: {
            'postId': postId,
            'postType': POSTTYPE.comment,
        },
        include: {
            attributes: ['id', 'name', 'loginid'],
            model: User,
        },
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, userListQuery, PLACEHOLDER.empty_string)
}

/**
 * Get list of comments liked by a user
 * @param {Integer} userId 
 */
exports.getLikeCommentList = async (userId) => {
    let commentListQuery = await Like.findAll({
        where: {
            userId: userId,
            'postType': POSTTYPE.comment,
        },
        include: {
            model: Comments,
        },
    }).catch((err) => {
        return utils.classResponse(false, PLACEHOLDER.empty_response, ERROR.error_data_field)
    })

    return utils.classResponse(true, commentListQuery, PLACEHOLDER.empty_string)
}

