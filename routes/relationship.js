const passport = require('passport')
const express = require('express')
const router = express.Router()

const authenticate = require('../controller/authJWT').authenticate
const friendRequest = require('../controller/changeFriendStatus').friendRequest

router.use('/friendstatus', authenticate, friendRequest)

module.exports = router
