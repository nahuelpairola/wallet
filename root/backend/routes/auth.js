const express = require('express')
const router = express.Router()

// validators
const validator = require('express-joi-validation').createValidator({})
const {UserBody,UserLogin} = require('../validators/schemas/user')

const {registration, login} = require('../controllers/auth')

router.route('/login').post(validator.body(UserLogin),login)
router.route('/registration').post(validator.body(UserBody),registration)

module.exports = router