const express = require('express')
const router = express.Router()

const {registration, login} = require('../controllers/auth')

router.route('/login').post(login)
router.route('/registration').post(registration)

module.exports = router