const express = require('express')
const router = express.Router()

const verifyJWT = require('../middlewares/authJWT').verifyJWT
const friendRequest = require('../controller/changeFriendStatus').friendRequest

router.use('/friendstatus', verifyJWT, friendRequest)

module.exports = router
