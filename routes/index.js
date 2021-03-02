const express = require('express')
const router = express.Router()

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.use('/user', require('./user'))
router.use('/userdetails', require('../controller/getUserDetails')) //!Debug route
router.use('/comments', require('./comments'))
router.use('/relationship', require('./relationship'))
router.use('/tweets', require('./tweets'))

module.exports = router
