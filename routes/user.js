const express = require('express')
const router = express.Router()

const authenticate = require('../controller/authJWT').authenticate
const user = require('../controller/user')

router.use('/login', user.userLogin)
router.use('/signup', user.userSignup)
router.use('/verify', user.verifyIfUserExists)
router.use('/updateprofile', authenticate, user.updateUserProfile)
router.use('/searchusers', authenticate, user.userSearch)
router.use('/friendrequestlist', authenticate, user.getFriendRequestList)

module.exports = router
