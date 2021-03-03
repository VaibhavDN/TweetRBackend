const express = require('express')
const router = express.Router()

router.use('/user', require('./user'))
router.use('/userdetails', require('../controller/getUserDetails')) //!Debug route
router.use('/comments', require('./comments'))
router.use('/relationship', require('./relationship'))
router.use('/tweets', require('./tweets'))

module.exports = router
