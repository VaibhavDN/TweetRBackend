const Op = require("sequelize").Op
const utils = require("../../utils")

const Tweets = require("../../models/Tweets")

const ERROR = require('../../errorConstants').ERROR

/**
 * Checks if the tweet exists in the Tweets model
 * @param {Integer} tweetId 
 */
const findIfTweetExists = async (tweetId) => {
    try {
        let findTweetQuery = await Tweets.findOne({
            where: {
                id: tweetId,
            }
        })

        return utils.classResponse(true, findTweetQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Adds new tweets in the Tweets model
 * @param {Integer} userId 
 * @param {String} name 
 * @param {Integer} loginid 
 * @param {String} tweetText 
 */
const addNewTweet = async (userId, name, loginid, tweetText) => {
    try {
        let addTweetQuery = await Tweets.create({
            userId: userId,
            name: name,
            loginid: loginid,
            tweet: tweetText,
        })

        return utils.classResponse(true, addTweetQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Update an existing tweets text in Tweets model
 * @param {Integer} tweetId 
 * @param {Integer} userId 
 * @param {String} tweetText 
 */
const updateExistingTweet = async (tweetId, userId, tweetText) => {
    try {
        let updateTweetQuery = await Tweets.update({
            tweet: tweetText,
        }, {
            where: {
                [Op.and]: [
                    { id: tweetId },
                    { userId: userId },
                ]
            }
        })

        return utils.classResponse(true, updateTweetQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}

/**
 * Delete's a tweet from the Tweets model
 * @param {Integer} tweetId 
 */
const deleteExistingTweet = async (tweetId) => {
    try {
        let removeTweetQuery = await Tweets.destroy({
            where: {
                id: tweetId,
            }
        })

        return utils.classResponse(true, removeTweetQuery, "")
    } catch (err) {
        return utils.classResponse(false, {}, ERROR.query_error)
    }
}



module.exports = {
    findIfTweetExists,
    addNewTweet,
    updateExistingTweet,
    deleteExistingTweet,
}
