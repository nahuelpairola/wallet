const Joi = require("joi")

const AmountBody = Joi.object({
  quantity: Joi.number().positive().precision(2).required(),
  movement: Joi.string().valid('input','output').required(),
  type: Joi.string().min(3).max(15).required()
}).required()

const AmountId = Joi.number().integer().options({convert:true}).required()

const AmountQuery = Joi.object({
  movement: Joi.string().lowercase().valid('input','output'),
  type: Joi.string().lowercase(),
  quantity: Joi.string().lowercase(),
  created_at: Joi.string()
})

module.exports = {AmountBody,AmountId,AmountQuery}