const express = require('express')
const app = express()
const PORT = 4000

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running at port: ${PORT}`)
})

app.use('/', require('./routes/index'))
