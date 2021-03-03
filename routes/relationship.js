const express = require('express')
const router = express.Router()
const changeFriendStatus = require('../controller/changeFriendStatus')

router.use('/friendstatus', changeFriendStatus.friendRequest)

module.exports = router
