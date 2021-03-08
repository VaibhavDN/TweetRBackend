const express = require('express')
const app = express()
const PORT = 4000

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running at port: ${PORT}`)
})

app.use('/', require('./routes/index'))
