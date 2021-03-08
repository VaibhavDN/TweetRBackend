const utils = require('../../utils')

const Tweets = require("../../models/Tweets")
const User = require("../../models/Users")
const Like = require('../../models/Like')
const Comments = require('../../models/Comments')
const POSTTYPE = require('./Constants').POSTTYPE

const ERROR = require('../../errorConstants').ERROR

//* Tweets
/**
 * Checks if a tweet is liked
 * @param {Integer} userId 
 * @param {Integer} postId 
 * @returns 
 */
 const isTweetLiked = async (userId, postId) => {
    try {
        let isLikedQuery = await Like.findOne({
            where: {
                'userId': userId,
                'postId': postId,
                'postType': POSTTYPE.tweet,
            }
        })

        if (isLikedQuery == null) {
            return utils.classResponse(true, { like: false }, "")
        }
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    }

    return utils.classResponse(true, { like: true }, "")
}

/**
 * Like a tweet with a likeType
 * @param {Integer} userId 
 * @param {Integer} postId 
 * @param {String} likeType 
 * @returns 
 */
const likeTweet = async (userId, postId, likeType) => {
    try {
        let likeTweetQuery = await Like.create({
            'userId': userId,
            'postId': postId,
            'likeType': likeType,
            'postType': POSTTYPE.tweet,
        })

        return utils.classResponse(true, likeTweetQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    }
}

/**
 * 
 * @param {Integer} userId 
 * @param {Integer} postId 
 * @returns 
 */
const unLikeTweet = async (userId, postId) => {
    try {
        let unLikeTweetQuery = await Like.destroy({
            where: {
                'userId': userId,
                'postId': postId,
                'postType': POSTTYPE.tweet,
            }
        })

        return utils.classResponse(true, unLikeTweetQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    }
}

/**
 * Get list of users who like a tweet
 * @param {Integer} tweetId 
 */
const getTweetLikeUserList = async (postId) => {
    try {
        let userListQuery = await Like.findAll({
            where: {
                'postId': postId,
                'postType': POSTTYPE.tweet,
            },
            include: {
                attributes: ['id', 'name', 'loginid'],
                model: User,
            },
        })

        return utils.classResponse(true, userListQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    }
}

/**
 * Get list of tweets liked by a user
 * @param {Integer} userId 
 */
const getLikeTweetList = async (userId) => {
    try {
        let tweetListQuery = await Like.findAll({
            where: {
                userId: userId,
                'postType': POSTTYPE.tweet,
            },
            include: {
                model: Tweets,
            },
        })

        return utils.classResponse(true, tweetListQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    }
}

//* Comments

/**
 * Database call to check if a comment is liked
 * @param {Integer} userId 
 * @param {Integer} commentId 
 */
 const isCommentLiked = async (userId, postId) => {
    try {
        let isLikedQuery = await Like.findOne({
            where: {
                'userId': userId,
                'postId': postId,
                'postType': POSTTYPE.comment,
            }
        })

        if (isLikedQuery == null) {
            return utils.classResponse(true, { like: false }, "")
        }
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    }

    return utils.classResponse(true, { like: true }, "")
}

/**
 * Database call to like a comment
 * @param {Integer} userId 
 * @param {Integer} commentId 
 */
const likeComment = async (userId, postId, likeType) => {
    try {
        let likeCommentQuery = await Like.create({
            'userId': userId,
            'postId': postId,
            'postType': POSTTYPE.comment,
            'likeType': likeType,
        })

        return utils.classResponse(true, likeCommentQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Database call to unlike a comment
 * @param {Integer} userId 
 * @param {Integer} commentId 
 */
const unLikeComment = async (userId, postId) => {
    try {
        let unLikeCommentQuery = await Like.destroy({
            where: {
                'userId': userId,
                'postId': postId,
                'postType': POSTTYPE.comment,
            }
        })

        return utils.classResponse(true, unLikeCommentQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    }
}

/**
 * Get list of users who like a comment
 * @param {Integer} tweetId 
 */
const getCommentLikeUserList = async (postId) => {
    try {
        let userListQuery = await Like.findAll({
            where: {
                'postId': postId,
                'postType': POSTTYPE.comment,
            },
            include: {
                attributes: ['id', 'name', 'loginid'],
                model: User,
            },
        })

        return utils.classResponse(true, userListQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    }
}

/**
 * Get list of comments liked by a user
 * @param {Integer} userId 
 */
const getLikeCommentList = async (userId) => {
    try {
        let commentListQuery = await Like.findAll({
            where: {
                userId: userId,
                'postType': POSTTYPE.comment,
            },
            include: {
                model: Comments,
            },
        })

        return utils.classResponse(true, commentListQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.error_data_field)
    }
}

module.exports = {
    isTweetLiked,
    likeTweet,
    unLikeTweet,
    getTweetLikeUserList,
    getLikeTweetList,
    isCommentLiked,
    likeComment,
    unLikeComment,
    getCommentLikeUserList,
    getLikeCommentList,
}
