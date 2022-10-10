const Joi = require("joi")

const AmountBody = Joi.object({
  quantity: Joi.number().positive().precision(2).required(),
  movement: Joi.string().valid('input','output').required(),
  type: Joi.string().min(3).max(15).required()
}).required()

const AmountId = Joi.number().integer().options({convert:true}).required()

module.exports = {AmountBody,AmountId}