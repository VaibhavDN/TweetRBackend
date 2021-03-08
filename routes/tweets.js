const express = require('express')
const router = express.Router()

const verifyJWT = require('../controller/authJWT').verifyJWT
const tweets = require('../controller/tweets')

router.post('/addtweet', verifyJWT, tweets.addTweet)
router.use('/deletetweet', verifyJWT, tweets.deleteTweet)
router.use('/gettweets', verifyJWT, tweets.getTweets)
router.use('/updatetweet', verifyJWT, tweets.updateTweet)
router.use('/istweetliked', verifyJWT, tweets.isTweetLiked)
router.use('/liketweet', verifyJWT, tweets.likeExistingTweet)
router.use('/unliketweet', verifyJWT, tweets.unLikeExistingTweet)
router.use('/likeuserlist', verifyJWT, tweets.tweetLikeUserList)
router.use('/liketweetlist', verifyJWT, tweets.userLikeTweetList)

module.exports = router
