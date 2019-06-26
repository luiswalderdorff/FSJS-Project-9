'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');

const { check, validationResult } = require('express-validator/check');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const router = express.Router();
const authenticate = require("./authenticate");


const courseValidation = [
  check('title')
    .exists() 
    .withMessage('Please provide a value for "title"'),
  check('description')
    .exists()
    .withMessage('Please provide a value for "description"'),
];


router.get("/", (req,res) => { //200
  // Returns a list of courses (including the user that owns each course)
});

router.get("/:id", (req,res) => { //200
  // Returns a the course (including the user that owns the course) for the provided course ID
});

router.post("/", [authenticate, courseValidation], (req,res) => { //201
  // Creates a course, sets the Location header to the URI for the course, and returns no content

  // If there are validation errors... // Maybe write separate function?
  if (!errors.isEmpty()) {
  	// Use the Array `map()` method to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);

    // Return the validation errors to the client.
    res.status(400).json({ errors: errorMessages });
  } else {

  }
});

router.put("/:id", [authenticate, courseValidation], (req,res) => { //204
  // Updates a course and returns no content

  // If there are validation errors...
  if (!errors.isEmpty()) {
  	// Use the Array `map()` method to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);

    // Return the validation errors to the client.
    res.status(400).json({ errors: errorMessages });
  } else {

  }
});

router.delete("/:id", authenticate, (req,res) => { //204
  //Deletes a course and returns no content
});

module.exports = router;