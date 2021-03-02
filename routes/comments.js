const express = require('express')
const router = express.Router()

router.post('/addcomment', require('../controller/comments').addUserComment)
router.get('/getcomments/:userId/:postId/:pageNo', require('../controller/comments').getUserComments)
router.post('/updatecomment', require('../controller/comments').updateUserComment)
router.use('/iscommentliked', require('../controller/comments').isCommentLiked)
router.use('/likecomment', require('../controller/comments').likeExistingComment)
router.use('/unlikecomment', require('../controller/comments').unLikeExistingComment)
router.use('/likeuserlist', require('../controller/comments').commentLikeUserList)
router.use('/likecommentlist', require('../controller/comments').userLikeCommentList)

module.exports = router
