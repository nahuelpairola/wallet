const express = require('express')
const router = express.Router()

const {login, registration} = require('../controllers/user')

router.route('/login').post(login)
router.route('/registration').post(registration)

module.exports = router