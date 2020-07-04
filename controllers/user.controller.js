const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
require('dotenv').config()

exports.testingRoute = (req, res, next) => {
  return res.json({ msg: 'Route working....' })
}
