const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const Employee = require('../models/empoyee');
const employeeValidationSchema = require("../JoiSchema");
const ensureAuthenticated = require('../middleware/auth'); // Import the authentication middleware

// Configure multer storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Corrected the folder name to 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid filename conflicts
  }
});

// Initialize multer with the storage configuration
const upload = multer({ storage });
router.use((req, res, next) => {
  res.locals.user = req.user; // Passport adds user info to req.user
  next();
});
// Serve the 'uploads' folder statically so images can be accessed
router.use('/createemployee', express.static('uploads'));
// delete route
// Route for deleting an employee
router.delete('/delete/:id', async (req, res, next) => {
  console.log(`DELETE request for employee ID: ${req.params.id}`); // Log the ID being deleted
  // Rest of your delete code...
});

router.delete('/delete/:id', async (req, res, next) => {
  const employeeId = req.params.id;

  try {
      const deletedEmployee = await Employee.findByIdAndDelete(employeeId);
      
      if (!deletedEmployee) {
          return res.status(404).send('Employee not found');
      }

      res.status(200).send('Employee deleted successfully');
  } catch (err) {
      return next(err);
  }
});
router.get("/dashboard", ensureAuthenticated, (req, res) => {
    res.render('pages/DashBoard.ejs');
});

// Route for registration page
router.get('/register', (req, res) => {
  res.render('pages/SignUp.ejs');
});

// Route for user registration
router.post('/register', (req, res, next) => {
  const { username, password } = req.body;

  User.register(new User({ username }), password, (err, user) => {
    if (err) {
      return next(err);
    }

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/dashboard');
    });
  });
});

// Route for login page
router.get('/login', (req, res) => {
  res.render('pages/login.ejs');
});

// Employee List Route (Protected)
router.get("/allemployee", ensureAuthenticated, async (req, res, next) => {
  try {
    const employees = await Employee.find({});
    res.render("pages/employeelst.ejs", { employees });
    console.log(employees);
  } catch (Err) {
    return next(Err);
  }
});

// Route for user login with Passport.js
router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// Route for logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});

// Route for employee creation page (Protected)
router.get('/createemployee', ensureAuthenticated, (req, res) => {
  res.render('pages/Employee.ejs');
});

// Route for handling employee creation with image upload (Protected)
router.post('/createemployee', ensureAuthenticated, upload.single('imgUpload'), async (req, res, next) => {
    const { name, email, mobile, designation, gender, courses } = req.body;
    
    const EmpData = {
      name,
      email,
      mobile,
      designation,
      gender,
      courses: Array.isArray(courses) ? courses : [courses],
      imgUpload: req.file ? `/uploads/${req.file.filename}` : ''
    };
  
    const { error } = employeeValidationSchema.validate(EmpData);
  
    if (error) {
      return next(error.message);
    }
  
    try {
      const Emp = new Employee(EmpData);
      const emp = await Emp.save();
  
      res.send(`Employee created successfully with image: ${EmpData.imgUpload}`);
    } catch (err) {
      return next(err);
    }
});
  
// Edit route (Protected)
router.get('/edit/:id', ensureAuthenticated, async (req, res, next) => {
  const employeeId = req.params.id;

  try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
          res.send("Employee not found");
      }
      res.render('pages/editEmployee.ejs', { employee });
  } catch (err) {
      return next(err);
  }
});

// Edit PUT route (Protected)
router.put('/edit/:id', ensureAuthenticated, upload.single('imgUpload'), async (req, res, next) => {
  const employeeId = req.params.id;

  try {
      const existingEmployee = await Employee.findById(employeeId);
      
      if (!existingEmployee) {
          return res.status(404).send('Employee not found');
      }

      const updatedData = {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
          designation: req.body.designation,
          gender: req.body.gender,
          courses: req.body.courses.split(',').map(course => course.trim())
      };

      if (req.file) {
          updatedData.imgUpload = req.file.path;
      } else {
          updatedData.imgUpload = existingEmployee.imgUpload;
      }

      const updatedEmployee = await Employee.findByIdAndUpdate(employeeId, updatedData, { new: true });

      if (!updatedEmployee) {
          return res.status(404).send('Error updating employee');
      }

      res.redirect('/allemployee');
  } catch (err) {
      return next(err);
  }
});
// search route 
// Route for searching employees
router.get('/search', ensureAuthenticated, async (req, res, next) => {
  const { keyword } = req.query; // Get the search keyword from the query parameters

  try {
      // Create a regex to search in a case-insensitive manner
      const regex = new RegExp(keyword, 'i'); // 'i' for case-insensitive search

      // Find employees matching the keyword in any of the specified fields
      const employees = await Employee.find({
          $or: [
              { name: regex },
              { email: regex },
              { mobile: regex },
              { designation: regex },
              { gender: regex },
              { courses: { $elemMatch: { $regex: regex } } } // Search within the array of courses
          ]
      });

      // Render the employee list with the found employees
      res.render('pages/employeelst.ejs', { employees });

  } catch (err) {
      // Handle errors
      return next(err);
  }
});



// Global Error Handling Middleware
router.use((err, req, res, next) => {
  res.render('Error/error.ejs', { err });
});

// 404 Error Handling Middleware (Page not found)
router.use((req, res, next) => {
  res.status(404).render('Error/error.ejs', {
    err: 'Page Not Found',
  });
});

module.exports = router;
