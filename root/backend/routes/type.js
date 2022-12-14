const express = require('express')
const router = express.Router()

// validators
const validator = require('express-joi-validation').createValidator({})
const {NewType,TypeId,UpdateType} = require('../validators-sanitizers/type')

const {
    createType,
    getTypes,
    updateType,
    deleteType
} = require('../controllers/type')

router.route('/').get(getTypes)
router.route('/').post(validator.body(NewType), createType)
router.route('/:id')
    .patch(validator.params(TypeId),validator.body(UpdateType),updateType)
    .delete(validator.params(TypeId),deleteType)

module.exports = router