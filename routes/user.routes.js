const express = require('express')
const router = express.Router()

//User Controller
const user = require('../controllers/user.controller')

//Admin Controller
const admin = require('../controllers/admin.controller')

// router.post('/admin/products', admin.createProduct)
module.exports = router
