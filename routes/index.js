const routerGetUserDetail = require('../controller/getUserDetails') //!Debug route
const routeComments = require('./comments')
const routeTweets = require('./tweets')
const routeUser = require('./user')
const routeRelationship = require('./relationship')

const express = require('express')
const router = express.Router()

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.use('/user', routeUser)
router.use('/userdetails', routerGetUserDetail)
router.use('/comments', routeComments)
router.use('/relationship', routeRelationship)
router.use('/tweets', routeTweets)

module.exports = router
