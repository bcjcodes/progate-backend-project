const jwt = require('jsonwebtoken')
const Product = require('../model/product')
const Admin = require('../model/admin')
exports.authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(403).send('Auth token not found')
  }

  const token = authHeader.split(' ')[1]
  jwt.verify(token, 'secrettoken', (err, user) => {
    if (err) {
      console.log(err)
      return res.status(403).send('Incorrect token')
    }

    req.user = user
    console.log(user)
    if (user.role === 'attendant' && user.adminAccess === true) {
      return next()
    } else {
      return res.status(401).send('Not Authorized')
    }
  })
}
