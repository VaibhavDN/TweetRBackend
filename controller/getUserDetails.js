const express = require('express')
const bodyParser = require('body-parser')
const usersModel = require('../models/Users')
const { Tweets, TweetLike } = require('../models/Tweets')
const { Comments } = require('../models/Comments')
const Relationships = require('../models/Relationships')
const routerGetUserDetail = express.Router()

routerGetUserDetail.use(bodyParser.urlencoded({ extended: false }))
routerGetUserDetail.use(bodyParser.json())

routerGetUserDetail.get('/', (req, res, next) => {
    console.log(req.url)
    let response = JSON.stringify({ "Error": "Get requests are not accepted in getUserDetails" })
    res.send(response)
})

routerGetUserDetail.post('/', async (req, res, next) => {
    let response = ""
    console.log(JSON.stringify(req.body), req.baseUrl, req.url)

    let getUserDetailsQuery = await usersModel.findAll({
        include: [
            {
                model: Tweets,
                include: [Comments, TweetLike],
            },
            {
                model: Relationships,
            }
        ]
    }).catch((err) => {
        console.log(err)
        response = JSON.stringify({ "Error": "Some error occurred" })
        res.send(response)
        return
    })

    response = JSON.stringify(getUserDetailsQuery)

    res.send(response)

})

module.exports = routerGetUserDetail
