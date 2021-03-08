const express = require('express')
const router = express.Router()

const verifyJWT = require('../controller/authJWT').verifyJWT
const friendRequest = require('../controller/changeFriendStatus').friendRequest

router.use('/friendstatus', verifyJWT, friendRequest)

module.exports = router
