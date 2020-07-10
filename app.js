const express = require('express')
const app = express()
const mongoose = require('mongoose')
// require('dotenv').config({path: __dirname + '/.env'})
require('dotenv').config()

//Call in the routes

const admin = require('./controllers/admin.controller')
const user = require('./controllers/user.controller')

//DB Config
let db = process.env.MONGODB_URI

//DB Connection
mongoose
  .connect(db, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Database Connected')
  })
  .catch(error => {
    console.log(error)
  })

//Initializing express json Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Use Routes
app.use('/api/v1', user)
app.use('/api/v1', admin)

const port = process.env.PORT
app.listen(port, () => console.log(`Server listening on port ${port}`))
