const { addTweet, getTweets, updateTweet, deleteTweet, isTweetLiked, likeExistingTweet, unLikeExistingTweet, tweetLikeUserList, userLikeTweetList } = require('../controller/tweets')
const express = require('express')
const router = express.Router()

router.post('/addtweet', addTweet)
router.use('/deletetweet', deleteTweet)
router.use('/gettweets/:userId/:pageNo', getTweets)
router.use('/updatetweet', updateTweet)
router.use('/istweetliked', isTweetLiked)
router.use('/liketweet', likeExistingTweet)
router.use('/unliketweet', unLikeExistingTweet)
router.use('/likeuserlist', tweetLikeUserList)
router.use('/liketweetlist', userLikeTweetList)

module.exports = router
