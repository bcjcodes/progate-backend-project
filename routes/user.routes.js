const express = require('express')
const router = express.Router()

const UserController = require('../controllers/user.controller')

router.get('/test', UserController.testingRoute)
module.exports = router
