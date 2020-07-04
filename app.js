const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()

//Call in the routes
const users = require('./routes/user.routes')

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
app.use('/api/v1', users)

const port = process.env.PORT
app.listen(port, () => console.log(`Server listening on port ${port}`))
