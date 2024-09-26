const Joi = require('joi');

// Joi schema for validating employee data
const employeeValidationSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(), // 10-digit mobile number
  designation: Joi.string().valid('HR', 'Manager', 'Sales').required(),
  gender: Joi.string().valid('M', 'F').required(),
  courses: Joi.alternatives().try(
    Joi.string().valid('MCA', 'BCA', 'BSC'),
    Joi.array().items(Joi.string().valid('MCA', 'BCA', 'BSC'))
  ).required(),
  imgUpload: Joi.string().required() // Will hold the image path
});


module.exports = employeeValidationSchema;