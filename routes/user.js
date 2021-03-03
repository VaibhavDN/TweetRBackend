const express = require('express')
const user = require('../controller/user')
const router = express.Router()

router.use('/login', user.userLogin)
router.use('/signup', user.userSignup)
router.use('/verify', user.verifyIfUserExists)
router.use('/updateprofile', user.updateUserProfile)
router.use('/searchusers', user.userSearch)

module.exports = router
