const express = require('express')
const router = express.Router()

const authenticate = require('../controller/authJWT').authenticate
const comments = require('../controller/comments')

router.post('/addcomment', authenticate, comments.addUserComment)
router.get('/getcomments', authenticate, comments.getUserComments)
router.post('/updatecomment', authenticate, comments.updateUserComment)
router.use('/iscommentliked', authenticate, comments.isCommentLiked)
router.use('/likecomment', authenticate, comments.likeExistingComment)
router.use('/unlikecomment', authenticate, comments.unLikeExistingComment)
router.use('/likeuserlist', authenticate, comments.commentLikeUserList)
router.use('/likecommentlist', authenticate, comments.userLikeCommentList)

module.exports = router
