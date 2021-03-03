const express = require('express')
const tweets = require('../controller/tweets')
const router = express.Router()

router.post('/addtweet', tweets.addTweet)
router.use('/deletetweet', tweets.deleteTweet)
router.use('/gettweets/:userId/:pageNo', tweets.getTweets)
router.use('/updatetweet', tweets.updateTweet)
router.use('/istweetliked', tweets.isTweetLiked)
router.use('/liketweet', tweets.likeExistingTweet)
router.use('/unliketweet', tweets.unLikeExistingTweet)
router.use('/likeuserlist', tweets.tweetLikeUserList)
router.use('/liketweetlist', tweets.userLikeTweetList)

module.exports = router
