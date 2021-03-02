const express = require('express')
const router = require('./routes/index')

const app = express()
const PORT = 4000

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running at port: ${PORT}`)
})

app.use('/', router)
