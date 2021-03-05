const express = require('express')
const router = express.Router()
const friendRequest = require('../controller/changeFriendStatus').friendRequest
const verifyJWT = require('../middlewares/authJWT').verifyJWT

router.use('/friendstatus', verifyJWT, friendRequest)

module.exports = router
