const express = require('express')
const router = express.Router()

const verifyJWT = require('../middlewares/authJWT').verifyJWT
const comments = require('../controller/comments')

router.post('/addcomment', verifyJWT, comments.addUserComment)
router.get('/getcomments', verifyJWT, comments.getUserComments)
router.post('/updatecomment', verifyJWT, comments.updateUserComment)
router.use('/iscommentliked', verifyJWT, comments.isCommentLiked)
router.use('/likecomment', verifyJWT, comments.likeExistingComment)
router.use('/unlikecomment', verifyJWT, comments.unLikeExistingComment)
router.use('/likeuserlist', verifyJWT, comments.commentLikeUserList)
router.use('/likecommentlist', verifyJWT, comments.userLikeCommentList)

module.exports = router
