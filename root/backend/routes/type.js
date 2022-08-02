const express = require('express')
const router = express.Router()

const {
    createType,
    getTypes,
    updateType,
    deleteType
} = require('../controllers/type')

router.route('/').get(getTypes).post(createType)
router.route('/:id').patch(updateType).delete(deleteType)

module.exports = router