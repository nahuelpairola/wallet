const express = require('express') 
const passwordResetRouter = express.Router()

const { resetPassword } = require('../controllers/user')

passwordResetRouter.route('')
    .post(resetPassword)

module.exports = passwordResetRouter