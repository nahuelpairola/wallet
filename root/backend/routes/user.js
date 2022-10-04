const express = require('express')
const router = express.Router()

const {updateUser, deleteUser} = require('../controllers/user')

router.route('/:id').patch(updateUser).delete(deleteUser)

module.exports = router