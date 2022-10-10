const express = require('express')
const router = express.Router()

const validator = require('express-joi-validation').createValidator({})
const {AmountBody,AmountId} = require('../validators/models/amount')

const {
    getAmounts,
    createAmount,
    updateAmount,
    deleteAmount,
} = require('../controllers/amount')

router.route('/')
    .get(getAmounts)
    .post(validator.body(AmountBody),createAmount)

router.route('/:id')
    .delete(validator.params(AmountId),deleteAmount)
    .patch(validator.params(AmountId), validator.body(AmountBody), updateAmount)

module.exports = router