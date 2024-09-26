const mongoose = require('mongoose');

// Define the Employee schema
const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    enum: ['HR', 'Manager', 'Sales'] // Limiting to specific values
  },
  gender: {
    type: String,
    required: true,
    enum: ['M', 'F'] // Male (M) or Female (F)
  },
  courses: {
    type: [String],
    enum: ['MCA', 'BCA', 'BSC'] // List of possible courses
  },
  imgUpload: {
    type: String, // URL or file path of the uploaded image
    required: true
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Create and export the Employee model
const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
