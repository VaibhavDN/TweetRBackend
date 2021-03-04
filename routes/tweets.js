const express = require('express')
const tweets = require('../controller/tweets')
const router = express.Router()
const authMiddleware = require('../middlewares/authJWT')

router.post('/addtweet', authMiddleware.verifyJWT, tweets.addTweet)
router.use('/deletetweet', authMiddleware.verifyJWT, tweets.deleteTweet)
router.use('/gettweets/:userId/:pageNo', tweets.getTweets)
router.use('/updatetweet', authMiddleware.verifyJWT, tweets.updateTweet)
router.use('/istweetliked', authMiddleware.verifyJWT, tweets.isTweetLiked)
router.use('/liketweet', authMiddleware.verifyJWT, tweets.likeExistingTweet)
router.use('/unliketweet', authMiddleware.verifyJWT, tweets.unLikeExistingTweet)
router.use('/likeuserlist', authMiddleware.verifyJWT, tweets.tweetLikeUserList)
router.use('/liketweetlist', authMiddleware.verifyJWT, tweets.userLikeTweetList)

module.exports = router
