const Op = require('sequelize').Op
const utils = require('../../utils')

const Like = require('../../models/Like')
const Comments = require('../../models/Comments')
const Tweets = require('../../models/Tweets')
const POSTTYPE = require('./Constants').POSTTYPE

const ERROR = require('../../errorConstants').ERROR

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
    try {
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
                order: [['updatedAt', 'DESC']],
            },
            where: {
                id: tweetId,
            }
        })

        return utils.classResponse(true, getCommentsQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Performs database call to add a comment at a particular tweet
 * @param {Integer} commentersId 
 * @param {String} name 
 * @param {String} commentText 
 * @param {Integer} tweetId 
 */
const addComment = async (commentersId, name, commentText, tweetId) => {
    try {
        let addCommentQuery = await Comments.create({
            commentersId: commentersId,
            commentersName: name,
            comment: commentText,
            postId: tweetId,
        })

        return utils.classResponse(true, addCommentQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Performs database call to update a particular comment
 * @param {Integer} commentId 
 * @param {Integer} commentersId 
 * @param {String} commentText 
 */
const updateComment = async (commentId, commentersId, commentText) => {
    try {
        let updateCommentQuery = await Comments.update({
            comment: commentText,
        }, {
            where: {
                [Op.and]: [
                    { id: commentId },
                    { commentersId: commentersId },
                ]
            }
        })

        return utils.classResponse(true, updateCommentQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}



module.exports = {
    getComments,
    addComment,
    updateComment,
}
