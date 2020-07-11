const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adminSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cfmPassword: {
    type: String,
    required: true
  },
  workExperience: {
    type: Number,
    required: true
  },
  adminAccess: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: 'attendant'
  }
})

// export model admin with adminSchema
module.exports = mongoose.model('admin', adminSchema)
