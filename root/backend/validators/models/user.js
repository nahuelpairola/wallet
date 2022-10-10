const Joi = require("joi")

const UserBody = Joi.object({
  first_name: Joi.string().min(3).max(15).required(),
  last_name: Joi.string().min(3).max(15).required(),
  email: Joi.string().email().trim().lowercase(),
  password: Joi.string().trim(),
  role: Joi.string().valid('user','admin').default('user')
}).required()

const UserId = Joi.number().integer().options({convert:true}).required()

const UserLogin = Joi.object({
  email: Joi.string().email().trim().lowercase(),
  password: Joi.string().trim()
})

module.exports = {
  UserBody,
  UserLogin,
  UserId,
}