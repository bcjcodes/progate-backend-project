const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({})

module.exports = User = mongoose.model('users', userSchema)
