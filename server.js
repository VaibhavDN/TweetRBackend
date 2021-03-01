const express = require('express')
const router = require('./routes/index')

const app = express()
const PORT = 4000

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running at port: ${PORT}`)
})

app.use('/', router)
