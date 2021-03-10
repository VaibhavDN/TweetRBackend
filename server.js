const passport = require('passport')
const express = require('express')
const app = express()

const passportStrategy = require('./controller/authJWT').passportStrategy

const PORT = 4000

passportStrategy(passport)
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running at port: ${PORT}`)
})

app.use('/', require('./routes/index'))
