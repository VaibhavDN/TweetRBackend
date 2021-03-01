const { userLogin, userSignup, verifyIfUserExists, updateUserProfile, userSearch } = require('../controller/user')

const express = require('express')
const router = express.Router()

router.use('/login', userLogin)
router.use('/signup', userSignup)
router.use('/verify', verifyIfUserExists)
router.use('/updateprofile', updateUserProfile)
router.use('/searchusers', userSearch)

module.exports = router
