const express = require('express')
const router = express.Router()
const changeFriendStatus = require('../controller/changeFriendStatus')
const authMiddleware = require('../middlewares/authJWT')

router.use('/friendstatus', authMiddleware.verifyJWT, changeFriendStatus.friendRequest)

module.exports = router
