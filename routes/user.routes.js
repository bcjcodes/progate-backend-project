const express = require('express')
const router = express.Router()

//User Controller
const user = require('../controllers/user.controller')
router.use(user);

//Admin Controller
const admin = require('../controllers/admin.controller')
router.use(admin);


module.exports = router
