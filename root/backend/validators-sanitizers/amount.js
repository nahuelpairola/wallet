const Joi = require("joi")

const isNumeric = (num) => (typeof(num) === 'number' || typeof(num) === "string" && num.trim() !== '') && !isNaN(num)

const isDate = (date) => {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

const quantityMethod = (quantity,helper) => {
  if(!quantity.includes(';')) return helper.error('quantity must contain ";"')
  let quantitiesArray = quantity.split(';').map((quantity) => isNumeric(quantity) ? Number(quantity) : '')
  return quantitiesArray
}

const typeMethod = (type, helper) => {
  const typesList = type.split(',')
  if(typesList.includes('')) return helper.error('query type must not contain an empty type')
  return typesList
}

const filterDateMethod = (created_at, helper) => {
  if(!created_at.includes(';')) return helper.error('created_at must contain ";"')
  let created_atArray = created_at.split(';').map((date)=>{
    if(isDate(date)) return date
    else return ''
  })
  return created_atArray
}

const creationDateMethod = (created_at,helper) => {
  if(isDate(created_at)) return created_at
  else return helper.error('created_at must be a date')
}

const AmountBody = Joi.object({
  quantity: Joi.number().positive().precision(2).required(),
  movement: Joi.string().valid('input','output').required(),
  type: Joi.string().min(3).max(15).required(),
  created_at: Joi.string().custom(creationDateMethod,'created_at validator').optional()
}).required()

const AmountQuery = Joi.object({
  movement: Joi.string().lowercase().valid('input','output').optional(),
  type: Joi.string().custom(typeMethod,'type validator').optional(),
  quantity: Joi.string().custom(quantityMethod,'quantity validator').optional(),
  created_at: Joi.string().custom(filterDateMethod,'created_at validator').optional(),
  page: Joi.number().positive().integer().optional(),
  operation: Joi.string().valid('join_types','join_movements').optional()
})

const AmountId = Joi.object({
  id:Joi.number().integer().options({convert:true}).required()
})


module.exports = {AmountBody,AmountId,AmountQuery}