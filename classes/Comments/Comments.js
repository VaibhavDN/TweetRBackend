const User = require('../../models/Users')
const Like = require('../../models/Like').Like
const Comments = require('../../models/Comments').Comments
const Tweets = require('../../models/Tweets').Tweets

const Op = require('sequelize').Op
const ERROR = require('../../errorConstants').ERROR
const utils = require('../../utils')
const constants = require('./Constants')

/**
 * Performs database call to get comments for a particular tweet
 * Also implements pagination
 * @param {Integer} pageSize 
 * @param {Integer} pageNo 
 * @param {Integer} tweetId 
 * 
 * @returns Query result
 */
const getComments = async (pageSize, pageNo, tweetId) => {
    let getCommentsQuery = await Tweets.findOne({
        include: {
            model: Comments,
            include: {
                model: Like,
                where: {
                    postType: constants.POSTTYPE.comment
                },
                required: false,
            },
            limit: pageSize,
            offset: ((pageNo - 1) * pageSize),
            order: [['updatedAt', 'DESC']],
        },
        where: {
            id: tweetId,
        }
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.query_error)
    })

    return utils.classResponse(true, getCommentsQuery, "")
}

/**
 * Performs database call to add a comment at a particular tweet
 * @param {Integer} commentersId 
 * @param {String} name 
 * @param {String} commentText 
 * @param {Integer} tweetId 
 */
const addComment = async (commentersId, name, commentText, tweetId) => {
    let addCommentQuery = await Comments.create({
        commentersId: commentersId,
        commentersName: name,
        comment: commentText,
        postId: tweetId,
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.query_error)
    })

    return utils.classResponse(true, addCommentQuery, "")
}

/**
 * Performs database call to update a particular comment
 * @param {Integer} commentId 
 * @param {Integer} commentersId 
 * @param {String} commentText 
 */
const updateComment = async (commentId, commentersId, commentText) => {
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
        return utils.classResponse(false, {}, ERROR.query_error)
    })

    return utils.classResponse(true, updateCommentQuery, "")
}

/**
 * Database call to check if a comment is liked
 * @param {Integer} userId 
 * @param {Integer} commentId 
 */
const isLiked = async (userId, postId) => {
    let isLikedQuery = await Like.findOne({
        where: {
            'userId': userId,
            'postId': postId,
            'postType': constants.POSTTYPE.comment,
        }
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    })

    if (isLikedQuery == null) {
        return utils.classResponse(true, { like: false }, "")
    }

    return utils.classResponse(true, { like: true }, "")
}

/**
 * Database call to like a comment
 * @param {Integer} userId 
 * @param {Integer} commentId 
 */
const likeComment = async (userId, postId, likeType) => {
    let likeCommentQuery = await Like.create({
        'userId': userId,
        'postId': postId,
        'postType': constants.POSTTYPE.comment,
        'likeType': likeType,
    }).catch((err) => {
        console.log(err)
        return utils.classResponse(false, {}, ERROR.query_error)
    })

    return utils.classResponse(true, likeCommentQuery, "")
}

/**
 * Database call to unlike a comment
 * @param {Integer} userId 
 * @param {Integer} commentId 
 */
const unLikeComment = async (userId, postId) => {
    let unLikeCommentQuery = await Like.destroy({
        where: {
            'userId': userId,
            'postId': postId,
            'postType': constants.POSTTYPE.comment,
        }
    }).catch((err) => {
        console.log(err)
        return utils.classResponse(false, {}, ERROR.error_data_field)
    })

    return utils.classResponse(true, unLikeCommentQuery, "")
}

/**
 * Get list of users who like a comment
 * @param {Integer} tweetId 
 */
const getLikeUserList = async (postId) => {
    let userListQuery = await Like.findAll({
        where: {
            'postId': postId,
            'postType': constants.POSTTYPE.comment,
        },
        include: {
            attributes: ['id', 'name', 'loginid'],
            model: User,
        },
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    })

    return utils.classResponse(true, userListQuery, "")
}

/**
 * Get list of comments liked by a user
 * @param {Integer} userId 
 */
const getLikeCommentList = async (userId) => {
    let commentListQuery = await Like.findAll({
        where: {
            userId: userId,
            'postType': constants.POSTTYPE.comment,
        },
        include: {
            model: Comments,
        },
    }).catch((err) => {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    })

    return utils.classResponse(true, commentListQuery, "")
}

module.exports = {
    'getComments': getComments,
    'addComment': addComment,
    'updateComment': updateComment,
    'isLiked': isLiked,
    'likeComment': likeComment,
    'unLikeComment': unLikeComment,
    'getLikeUserList': getLikeUserList,
    'getLikeCommentList': getLikeCommentList,
}
