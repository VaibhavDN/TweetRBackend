const passport = require('passport')
const express = require('express')
const router = express.Router()

const authenticate = require('../controller/authJWT').authenticate
const tweets = require('../controller/tweets')

router.post('/addtweet', authenticate, tweets.addTweet)
router.use('/deletetweet', authenticate, tweets.deleteTweet)
router.use('/gettweets', authenticate, tweets.getTweets)
router.use('/updatetweet', authenticate, tweets.updateTweet)
router.use('/istweetliked', authenticate, tweets.isTweetLiked)
router.use('/liketweet', authenticate, tweets.likeExistingTweet)
router.use('/unliketweet', authenticate, tweets.unLikeExistingTweet)
router.use('/likeuserlist', authenticate, tweets.tweetLikeUserList)
router.use('/liketweetlist', authenticate, tweets.userLikeTweetList)

module.exports = router
