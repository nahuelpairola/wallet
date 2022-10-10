const express = require('express')
const router = express.Router()

// validators
const validator = require('express-joi-validation').createValidator({})
const {UserBody,UserId} = require('../validators/schemas/user')

const {updateUser, deleteUser} = require('../controllers/user')

router.route('/:id')
    .patch(validator.body(UserBody), validator.params(UserId), updateUser)
    .delete(validator.params(UserId), deleteUser)

module.exports = router