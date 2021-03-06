const express = require('express')
const router = express.Router()

const analytics = require('../controller/analytics')

router.post('/', analytics.deviceAnalytics)
module.exports = router
