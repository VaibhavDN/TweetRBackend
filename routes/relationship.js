const { friendRequest } = require('../controller/changeFriendStatus')

const express = require('express')
const router = express.Router()

router.use('/friendstatus', friendRequest)

module.exports = router
