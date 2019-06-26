'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');

const { check, validationResult } = require('express-validator/check');
const bcryptjs = require('bcryptjs');
const authenticate = require("./authenticate");

const router = express.Router();


router.get("/", authenticate, (req,res) => { //200
 res.json(req.currentUser).status(200);
});

router.post("/", [
  check('firstName')
    .exists() 
    .withMessage('Please provide a value for "firstName"'),
  check('lastName')
    .exists()
    .withMessage('Please provide a value for "lastName"'),
  check('emailAddress')
    .exists()
    .withMessage('Please provide a value for "emailAddress"')
    .isEmail()
  	.withMessage('Please provide a valid email address for "emailAddress"'),
  check('password')
    .exists()
    .withMessage('Please provide a value for "password"'),
], (req,res) => { //201
  // Creates a user, sets the Location header to "/", and returns no content

  // If there are validation errors...
  if (!errors.isEmpty()) {
  	// Use the Array `map()` method to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);

    // Return the validation errors to the client.
    res.status(400).json({ errors: errorMessages });
  } else {
  	// Get the user from the request body
    const user = req.body;

    // Hash new users password
    user.password = bcryptjs.hashSync(user.password);

    // Add the user to the users array --> Rewrite
    users.push(user);

    // Set the status to 201 and end the response
    res.status(201).end();
  }
});

module.exports = router;