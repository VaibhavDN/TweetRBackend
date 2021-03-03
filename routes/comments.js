const express = require('express')
const comments = require('../controller/comments')
const router = express.Router()

router.post('/addcomment', comments.addUserComment)
router.get('/getcomments/:userId/:postId/:pageNo', comments.getUserComments)
router.post('/updatecomment', comments.updateUserComment)
router.use('/iscommentliked', comments.isCommentLiked)
router.use('/likecomment', comments.likeExistingComment)
router.use('/unlikecomment', comments.unLikeExistingComment)
router.use('/likeuserlist', comments.commentLikeUserList)
router.use('/likecommentlist', comments.userLikeCommentList)

module.exports = router
