const express = require('express')
const user = require('../controller/user')
const auth = require('../controller/auth')
const authMiddleware = require('../middlewares/authJWT')
const router = express.Router()

router.use('/login', auth.userLogin)
router.use('/signup', user.userSignup)
router.use('/verify', authMiddleware.verifyJWT, user.verifyIfUserExists)
router.use('/updateprofile', user.updateUserProfile)
router.use('/searchusers', authMiddleware.verifyJWT, user.userSearch)
router.use('/friendrequestlist/:userId', authMiddleware.verifyJWT, user.getFriendRequestList)

module.exports = router
