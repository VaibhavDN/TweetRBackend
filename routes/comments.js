const express = require('express')
const router = express.Router()
const comments = require('../controller/comments')
const authMiddleware = require('../middlewares/authJWT')

router.post('/addcomment', authMiddleware.verifyJWT, comments.addUserComment)
router.get('/getcomments/:userId/:postId/:pageNo', authMiddleware.verifyJWT, comments.getUserComments)
router.post('/updatecomment', authMiddleware.verifyJWT, comments.updateUserComment)
router.use('/iscommentliked', authMiddleware.verifyJWT, comments.isCommentLiked)
router.use('/likecomment', authMiddleware.verifyJWT, comments.likeExistingComment)
router.use('/unlikecomment', authMiddleware.verifyJWT, comments.unLikeExistingComment)
router.use('/likeuserlist', authMiddleware.verifyJWT, comments.commentLikeUserList)
router.use('/likecommentlist', authMiddleware.verifyJWT, comments.userLikeCommentList)

module.exports = router
