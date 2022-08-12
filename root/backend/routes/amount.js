const express = require('express')
const router = express.Router()

const {
    getAmounts,
    createAmount,
    updateAmount,
    deleteAmount,
} = require('../controllers/amount')

router.route('/').get(getAmounts).post(createAmount)
router.route('/:id').delete(deleteAmount).patch(updateAmount)

module.exports = router