const express = require('express')
const user = require('../controller/user')
const auth = require('../controller/auth')
const verifyJWT = require('../middlewares/authJWT').verifyJWT
const router = express.Router()

router.use('/login', auth.userLogin)
router.use('/signup', user.userSignup)
router.use('/verify', user.verifyIfUserExists)
router.use('/updateprofile', user.updateUserProfile)
router.use('/searchusers', verifyJWT, user.userSearch)
router.use('/friendrequestlist', verifyJWT, user.getFriendRequestList)

module.exports = router
