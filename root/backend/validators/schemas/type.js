const Joi = require("joi")

const NewType = Joi.object({
  movement: Joi.string().valid('input','output').required(),
  name: Joi.string().min(3).max(15).required(),
}).required()

const TypeId = Joi.number().required()

module.exports = {NewType,TypeId} 
