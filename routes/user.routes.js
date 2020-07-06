const express = require('express')
const router = express.Router()

//User Controller
const user = require('../controllers/user.controller')
router.use(user);


module.exports = router
