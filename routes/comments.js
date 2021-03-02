const { addUserComment, getUserComments, updateUserComment, isCommentLiked, likeExistingComment, unLikeExistingComment, commentLikeUserList, userLikeCommentList } = require('../controller/comments')
const express = require('express')
const router = express.Router()

router.post('/addcomment', addUserComment)
router.get('/getcomments/:userId/:postId/:pageNo', getUserComments)
router.post('/updatecomment', updateUserComment)
router.use('/iscommentliked', isCommentLiked)
router.use('/likecomment', likeExistingComment)
router.use('/unlikecomment', unLikeExistingComment)
router.use('/likeuserlist', commentLikeUserList)
router.use('/likecommentlist', userLikeCommentList)

module.exports = router
