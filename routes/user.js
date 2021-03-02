const express = require('express')
const router = express.Router()

router.use('/login', require('../controller/user').userLogin)
router.use('/signup', require('../controller/user').userSignup)
router.use('/verify', require('../controller/user').verifyIfUserExists)
router.use('/updateprofile', require('../controller/user').updateUserProfile)
router.use('/searchusers', require('../controller/user').userSearch)

module.exports = router
