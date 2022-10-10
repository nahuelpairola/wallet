const Joi = require("joi")

const AmountBody = Joi.object({
  quantity: Joi.number().positive().precision(2).required(),
  movement: Joi.string().valid('input','output').required(),
  type: Joi.string().min(3).max(15).required()
}).required()

const AmountQuery = Joi.object({
  movement: Joi.string().lowercase().valid('input','output'),
  type: Joi.string().lowercase(),
  quantity: Joi.string().lowercase(),
  created_at: Joi.string()
})

const AmountId = Joi.object({
  id:Joi.number().integer().options({convert:true}).required()
})

module.exports = {AmountBody,AmountId,AmountQuery}