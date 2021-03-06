const express = require('express')
const router = express.Router()

router.use('/user', require('./user'))
router.use('/comments', require('./comments'))
router.use('/relationship', require('./relationship'))
router.use('/tweets', require('./tweets'))
router.use('/deviceanalytics', require('./analytics'))

//!Debug routes
router.use('/userdetails', require('../controller/getUserDetails'))
router.use('/blob', require('../controller/images').getImageBlob)

module.exports = router
