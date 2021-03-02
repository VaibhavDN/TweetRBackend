const express = require('express')
const router = express.Router()

router.post('/addtweet', require('../controller/tweets').addTweet)
router.use('/deletetweet', require('../controller/tweets').deleteTweet)
router.use('/gettweets/:userId/:pageNo', require('../controller/tweets').getTweets)
router.use('/updatetweet', require('../controller/tweets').updateTweet)
router.use('/istweetliked', require('../controller/tweets').isTweetLiked)
router.use('/liketweet', require('../controller/tweets').likeExistingTweet)
router.use('/unliketweet', require('../controller/tweets').unLikeExistingTweet)
router.use('/likeuserlist', require('../controller/tweets').tweetLikeUserList)
router.use('/liketweetlist', require('../controller/tweets').userLikeTweetList)

module.exports = router
